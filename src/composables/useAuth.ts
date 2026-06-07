import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { useNegocioStore } from '@/stores/negocio.store'
import { isClienteRole } from '@/types/user.types'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const router = useRouter()

  const { isAuthenticated, loading, error } = storeToRefs(authStore)
  const { profile } = storeToRefs(userStore)

  async function login(payload: LoginPayload, redirect?: string) {
    await authStore.login(payload)
    const role = userStore.profile?.role
    if (role !== undefined && !isClienteRole(role)) {
      await useNegocioStore().fetchEstabelecimentos(true)
    }
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
    const role = userStore.profile?.role
    if (role !== undefined && !isClienteRole(role) && authStore.isAuthenticated) {
      await useNegocioStore().fetchEstabelecimentos()
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
