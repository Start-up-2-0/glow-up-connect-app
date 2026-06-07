import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole } from '@/types/user.types'
import { isOnboardingCheckoutPath } from '@/utils/authRedirect'

export const authGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const clienteOnly = to.matched.some((record) => record.meta.clienteOnly)
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

  if (
    requiresAuth
    && authStore.isAuthenticated
    && userStore.profile
    && !userStore.profile.ativo
    && businessOnly
    && !to.path.startsWith(ROUTE_PATHS.CONFIRM_EMAIL)
    && !to.matched.some((record) => record.meta.onboardingAssinatura)
  ) {
    return {
      path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
      query: { email: userStore.profile.email },
    }
  }

  if (requiresAuth && authStore.isAuthenticated && role !== undefined) {
    if (clienteOnly && !isClienteRole(role)) {
      return { path: ROUTE_PATHS.DASHBOARD }
    }
    const allowClienteOnboarding = to.matched.some(
      (record) => record.meta.allowClienteOnboarding === true,
    )

    if (businessOnly && isClienteRole(role) && !allowClienteOnboarding) {
      return { path: ROUTE_PATHS.DASHBOARD }
    }

    if (!isClienteRole(role)) {
      await useNegocioStore().fetchEstabelecimentos()
    }
  }

  return true
}
