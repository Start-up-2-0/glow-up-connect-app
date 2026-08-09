import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { useUserStore } from './user.store'
import { useNegocioStore } from './negocio.store'
import { useAssinaturaStore } from './assinatura.store'
import type { LoginPayload, StoredSession } from '@/types/auth.types'
import {
  clearSessionStorage,
  hasActiveSessionHint,
  persistSession,
  readStoredSession,
} from '@/utils/storage'
import { startSessionRefreshScheduler, stopSessionRefreshScheduler } from '@/composables/useSessionRefresh'

export const useAuthStore = defineStore('auth', () => {
  const sessionActive = ref(false)
  const expiresAt = ref<string | null>(null)
  const refreshExpiresAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => sessionActive.value)

  function applySession(session: StoredSession, options?: { persist?: boolean }) {
    sessionActive.value = true
    expiresAt.value = session.expiresAt
    refreshExpiresAt.value = session.refreshExpiresAt
    if (options?.persist !== false) {
      persistSession({
        ...session,
        token: '',
        refreshToken: '',
      })
    }
    startSessionRefreshScheduler()
  }

  function hydrateFromStorage() {
    const stored = readStoredSession()
    if (!hasActiveSessionHint() || !stored.expiresAt) {
      clearSession()
      return
    }

    const expiresMs = new Date(stored.expiresAt).getTime()
    if (Number.isNaN(expiresMs) || expiresMs <= Date.now()) {
      // Access pode ter expirado; o refresh cookie ainda pode renovar.
      // Mantém hint se refreshExpiresAt for futuro.
      const refreshMs = stored.refreshExpiresAt
        ? new Date(stored.refreshExpiresAt).getTime()
        : NaN
      if (Number.isNaN(refreshMs) || refreshMs <= Date.now()) {
        clearSession()
        return
      }
    }

    sessionActive.value = true
    expiresAt.value = stored.expiresAt ?? null
    refreshExpiresAt.value = stored.refreshExpiresAt ?? null
  }

  function clearSession() {
    sessionActive.value = false
    expiresAt.value = null
    refreshExpiresAt.value = null
    stopSessionRefreshScheduler()
    clearSessionStorage()
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.login(payload)
      const loginData = data.data
      applySession({
        token: '',
        refreshToken: '',
        expiresAt: loginData.expiresAt,
        refreshExpiresAt: loginData.refreshExpiresAt,
      })
      useUserStore().setUserFromSummary(loginData.usuario)
      return loginData
    } catch (err) {
      error.value = 'Falha no login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      if (sessionActive.value) {
        await authService.logout()
      }
    } catch {
      // logout local mesmo se API falhar
    } finally {
      clearSession()
      useUserStore().clear()
      useNegocioStore().clear()
      useAssinaturaStore().clear()
      loading.value = false
    }
  }

  return {
    /** @deprecated Tokens não ficam mais no JS; mantido vazio por compatibilidade. */
    token: computed(() => null as string | null),
    refreshToken: computed(() => null as string | null),
    sessionActive,
    expiresAt,
    refreshExpiresAt,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    hydrateFromStorage,
    clearSession,
    applySession,
  }
})
