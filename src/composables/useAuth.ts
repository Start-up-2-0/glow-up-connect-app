import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const router = useRouter()

  const { isAuthenticated, loading, error } = storeToRefs(authStore)
  const { profile } = storeToRefs(userStore)

  async function login(payload: LoginPayload, redirect?: string) {
    await authStore.login(payload)
    await router.push(redirect ?? ROUTE_PATHS.DASHBOARD)
  }

  async function logout() {
    await authStore.logout()
    await router.push(ROUTE_PATHS.LOGIN)
  }

  async function ensureProfile() {
    if (!profile.value && authStore.isAuthenticated) {
      await userStore.fetchMe()
    }
  }

  return {
    isAuthenticated,
    loading,
    error,
    profile,
    login,
    logout,
    ensureProfile,
  }
}
