import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { isOnboardingCheckoutPath } from '@/utils/authRedirect'

export const authGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const businessOnly = to.matched.some((record) => record.meta.businessOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    if (
      to.matched.some((record) => record.meta.onboardingAssinatura) ||
      isOnboardingCheckoutPath(to.path)
    ) {
      return {
        path: ROUTE_PATHS.ONBOARDING_ASSINATURA,
        query: to.query.planoId ? { planoId: to.query.planoId } : to.query,
      }
    }

    return {
      path: ROUTE_PATHS.LOGIN,
      query: { redirect: to.fullPath },
    }
  }

  if (guestOnly && authStore.isAuthenticated) {
    return { path: ROUTE_PATHS.DASHBOARD }
  }

  if (
    authStore.isAuthenticated
    && to.matched.some((record) => record.meta.onboardingAssinatura)
  ) {
    return {
      path: ROUTE_PATHS.ONBOARDING_CONTRATAR,
      query: to.query.planoId ? { planoId: to.query.planoId } : to.query,
    }
  }

  if (requiresAuth && authStore.isAuthenticated && !userStore.profile) {
    try {
      await userStore.fetchMe()
    } catch {
      await authStore.logout()
      return {
        path: ROUTE_PATHS.LOGIN,
        query: { redirect: to.fullPath },
      }
    }
  }

  const role = userStore.profile?.role

  const assinaturaOnboardingLogado = to.matched.some(
    (record) => record.meta.assinaturaOnboardingLogado === true,
  )

  if (
    requiresAuth
    && authStore.isAuthenticated
    && userStore.profile
    && !userStore.profile.ativo
    && (businessOnly || assinaturaOnboardingLogado)
    && !to.path.startsWith(ROUTE_PATHS.CONFIRM_EMAIL)
    && !to.matched.some((record) => record.meta.onboardingAssinatura)
  ) {
    return {
      path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
      query: { email: userStore.profile.email },
    }
  }

  if (requiresAuth && authStore.isAuthenticated && role !== undefined) {
    const negocioStore = useNegocioStore()
    await negocioStore.fetchEstabelecimentos()

    const allowClienteOnboarding = to.matched.some(
      (record) => record.meta.allowClienteOnboarding === true,
    )

    if (businessOnly && !allowClienteOnboarding && negocioStore.estabelecimentos.length === 0) {
      return { path: ROUTE_PATHS.DASHBOARD }
    }
  }

  return true
}
