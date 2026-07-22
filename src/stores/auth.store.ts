import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { useUserStore } from './user.store'
import { useNegocioStore } from './negocio.store'
import { useAssinaturaStore } from './assinatura.store'
import type { LoginPayload, StoredSession } from '@/types/auth.types'
import {
  clearSessionStorage,
  persistSession,
  readStoredSession,
} from '@/utils/storage'
import { startSessionRefreshScheduler, stopSessionRefreshScheduler } from '@/composables/useSessionRefresh'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiresAt = ref<string | null>(null)
  const refreshExpiresAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function applySession(session: StoredSession, options?: { persist?: boolean }) {
    token.value = session.token
    refreshToken.value = session.refreshToken
    expiresAt.value = session.expiresAt
    refreshExpiresAt.value = session.refreshExpiresAt
    if (options?.persist !== false) {
      persistSession(session)
    }
    startSessionRefreshScheduler()
  }

  function hydrateFromStorage() {
    const stored = readStoredSession()
    if (stored.token) token.value = stored.token
    if (stored.expiresAt) expiresAt.value = stored.expiresAt
    if (stored.refreshExpiresAt) refreshExpiresAt.value = stored.refreshExpiresAt
  }

  function clearSession() {
    token.value = null
    refreshToken.value = null
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
        token: loginData.token,
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
      if (token.value) {
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
    token,
    refreshToken,
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
