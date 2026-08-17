import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useAppStore } from '@/stores/app.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { useNegocioStore } from '@/stores/negocio.store'
import { isExternalRedirect } from '@/utils/authRedirect'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const router = useRouter()

  const { isAuthenticated, loading, error } = storeToRefs(authStore)
  const { profile } = storeToRefs(userStore)

  async function login(payload: LoginPayload, redirect?: string) {
    await authStore.login(payload)
    await useNegocioStore().fetchEstabelecimentos(true)
    if (redirect && isExternalRedirect(redirect)) {
      window.location.assign(redirect)
      return
    }
    await router.push(redirect ?? ROUTE_PATHS.DASHBOARD)
  }

  async function reativarConta(payload: LoginPayload, redirect?: string) {
    await authStore.reativarConta(payload)
    await useNegocioStore().fetchEstabelecimentos(true)
    if (redirect && isExternalRedirect(redirect)) {
      window.location.assign(redirect)
      return
    }
    await router.push(redirect ?? ROUTE_PATHS.DASHBOARD)
  }

  async function logout() {
    await authStore.logout()
    // O tema vale apenas enquanto o usuário está logado: no logout reseta p/ claro
    // e remove a escolha do cache do navegador.
    useAppStore().resetTheme()
    // Hard navigation no mesmo domínio do app.
    // Evita remounts (ex.: AssinaturaView) que chamavam window.location na landing.
    window.location.assign(`${window.location.origin}${ROUTE_PATHS.LOGIN}`)
  }

  async function ensureProfile() {
    if (!profile.value && authStore.isAuthenticated) {
      await userStore.fetchMe()
    }
    if (authStore.isAuthenticated) {
      await useNegocioStore().fetchEstabelecimentos()
    }
  }

  return {
    isAuthenticated,
    loading,
    error,
    profile,
    login,
    reativarConta,
    logout,
    ensureProfile,
  }
}
