import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL, TOKEN_HEADER } from '@/constants/storageKeys'
import { ROUTE_PATHS } from '@/constants/routes'
import type { ApiErrorResponse } from '@/types/api.types'
import type { AuthTokens } from '@/types/auth.types'
import {
  clearSessionStorage,
  getAccessToken,
  setAccessToken,
} from '@/utils/storage'
import { syncSession } from '@/utils/sessionSync'
import {
  acquireRequestProof,
  invalidateRequestProofPool,
  isExemptRequestProofPath,
  isRequestProofError,
  REQUEST_PROOF_HEADER,
} from '@/composables/useRequestProof'
import { getUpgradeInfo } from '@/constants/upgradeMessages'
import { useAppStore } from '@/stores/app.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useLoadingStore } from '@/stores/loading.store'
import { MOCK_MODE } from '@/mocks/config'

type QueueCallback = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueCallback[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  failedQueue = []
}

const PUBLIC_API_PATHS = ['/auth/login', '/auth/refresh', '/planos', '/publico/']

function isPublicApiPath(url?: string): boolean {
  if (!url) return false
  return PUBLIC_API_PATHS.some((path) => url.includes(path))
}

/** Caminhos de infraestrutura / listas com skeleton local que não devem acionar o loading global. */
const LOADING_EXCLUDED_PATHS = [
  '/auth/refresh',
  '/security/request-proof',
  '/agendamentos/me',
  '/dashboard',
  '/publico/estabelecimentos/proximos',
]

function isExcludedLoadingPath(url?: string): boolean {
  if (!url) return false
  return LOADING_EXCLUDED_PATHS.some((path) => url.includes(path))
}

function shouldAttemptRefresh(error: AxiosError<ApiErrorResponse>, url?: string) {
  if (error.response?.status !== 401) return false
  if (!url) return false
  if (isPublicApiPath(url)) return false

  const code = error.response.data?.code
  return !code || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'UNAUTHORIZED'
}

function sanitizeRedirectPath(path: string): string {
  // Garante que o caminho seja relativo e não comece com // ou @
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('@')) {
    return '/'
  }
  // Remove caracteres potencialmente perigosos.
  // Permitimos apenas caracteres alfanuméricos, /, ?, =, &, - e _
  const sanitized = path.replace(/[^a-zA-Z0-9/?=&\-_]/g, '')
  return sanitized || '/'
}

function redirectToLogin() {
  clearSessionStorage()
  const isAuthRoute = window.location.pathname.startsWith('/auth')
  if (!isAuthRoute) {
    const sanitizedPath = sanitizeRedirectPath(window.location.pathname + window.location.search)
    const redirect = encodeURIComponent(sanitizedPath)
    window.location.href = `${ROUTE_PATHS.LOGIN}?redirect=${redirect}`
  }
}

async function refreshAccessToken(client: AxiosInstance): Promise<string> {
  const { data } = await client.post<{ success: boolean; data: AuthTokens }>(
    '/auth/refresh',
    {},
    {
      headers: { [TOKEN_HEADER]: undefined },
      withCredentials: true,
    },
  )

  const tokens = data.data
  syncSession({
    token: tokens.token,
    refreshToken: '',
    expiresAt: tokens.expiresAt,
    refreshExpiresAt: tokens.refreshExpiresAt,
  })
  return tokens.token
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Loading global de requisição (ignora infraestrutura silenciosa).
  if (!isExcludedLoadingPath(config.url)) {
    useLoadingStore().start()
  }

  // Modo mockado: intercepta a chamada no adapter, sem tocar na rede real.
  if (MOCK_MODE) {
    const { getMockAdapter } = await import('@/mocks')
    config.adapter = getMockAdapter() as unknown as InternalAxiosRequestConfig['adapter']
    return config
  }

  const token = getAccessToken()
  if (token && config.headers) {
    config.headers[TOKEN_HEADER] = token
  }

  if (!isExemptRequestProofPath(config.url)) {
    const proof = await acquireRequestProof(config.method, config.url)
    if (proof && config.headers) {
      config.headers[REQUEST_PROOF_HEADER] = proof
    }
  }

  return config
})

function handleSubscriptionError(error: AxiosError<ApiErrorResponse>) {
  const status = error.response?.status
  const code = error.response?.data?.code

  if (status !== 403 || !code) return false

  if (code === 'SUBSCRIPTION_MODULE_BLOCKED') {
    const modulo =
      typeof error.response?.data?.details === 'object' &&
      error.response.data.details !== null &&
      'modulo' in error.response.data.details
        ? String((error.response.data.details as { modulo: string }).modulo)
        : undefined

    const info = getUpgradeInfo(modulo ?? '')
    useAppStore().openUpgradeModal({
      modulo,
      mensagem: info.mensagem,
      planoMinimo: info.planoMinimo,
    })
    return true
  }

  if (code === 'INVALID_SUBSCRIPTION_SCOPE') {
    useNotificationsStore().push('warning', 'Selecione um estabelecimento para continuar.')
    return true
  }

  return false
}

api.interceptors.response.use(
  (response) => {
    if (!isExcludedLoadingPath(response.config.url)) {
      useLoadingStore().finish()
    }
    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!isExcludedLoadingPath(error.config?.url)) {
      useLoadingStore().finish()
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _proofRetry?: boolean
    }
    const requestUrl = originalRequest?.url

    if (
      originalRequest &&
      error.response?.status === 403 &&
      isRequestProofError(error.response.data?.code) &&
      !originalRequest._proofRetry
    ) {
      originalRequest._proofRetry = true
      invalidateRequestProofPool()
      const proof = await acquireRequestProof(originalRequest.method, requestUrl)
      if (proof && originalRequest.headers) {
        originalRequest.headers[REQUEST_PROOF_HEADER] = proof
        return api(originalRequest)
      }
    }

    if (handleSubscriptionError(error)) {
      return Promise.reject(error)
    }

    if (error.response?.status === 429) {
      const code = error.response.data?.code
      const defaultMessage = 'Muitas requisições. Por favor, tente novamente mais tarde.'

      const message = code === 'IP_BLOCKED_24H'
        ? defaultMessage
        : error.response.data?.message ?? defaultMessage

      useNotificationsStore().push(
        code === 'IP_BLOCKED_24H' ? 'error' : 'warning',
        message,
      )
      return Promise.reject(error)
    }

    if (!originalRequest || !shouldAttemptRefresh(error, requestUrl)) {
      if (error.response?.status === 401 && !isPublicApiPath(requestUrl)) {
        redirectToLogin()
      }
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      redirectToLogin()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers[TOKEN_HEADER] = token
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const newToken = await refreshAccessToken(api)
      setAccessToken(newToken)
      processQueue(null, newToken)
      originalRequest.headers[TOKEN_HEADER] = newToken
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
