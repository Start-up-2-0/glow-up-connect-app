import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole } from '@/types/user.types'

export const authGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const clienteOnly = to.matched.some((record) => record.meta.clienteOnly)
  const businessOnly = to.matched.some((record) => record.meta.businessOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
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

  if (requiresAuth && authStore.isAuthenticated && role !== undefined) {
    if (clienteOnly && !isClienteRole(role)) {
      return { path: ROUTE_PATHS.DASHBOARD }
    }
    if (businessOnly && isClienteRole(role)) {
      return { path: ROUTE_PATHS.DASHBOARD }
    }

    if (!isClienteRole(role)) {
      await useNegocioStore().fetchEstabelecimentos()
    }
  }

  return true
}
