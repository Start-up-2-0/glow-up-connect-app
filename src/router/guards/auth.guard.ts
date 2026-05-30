import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'

export const authGuard: NavigationGuard = async (to) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

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

  return true
}
