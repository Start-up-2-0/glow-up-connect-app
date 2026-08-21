import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL } from '@/constants/storageKeys'
import { ROUTE_PATHS } from '@/constants/routes'
import type { ApiErrorResponse } from '@/types/api.types'
import type { AuthTokens } from '@/types/auth.types'
import {
  clearSessionStorage,
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
import { useNegocioStore } from '@/stores/negocio.store'
import { MOCK_MODE } from '@/mocks/config'

type QueueCallback = {
  resolve: () => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueCallback[] = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
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

async function refreshAccessToken(client: AxiosInstance): Promise<void> {
  const { data } = await client.post<{ success: boolean; data: AuthTokens }>(
    '/auth/refresh',
    {},
    {
      withCredentials: true,
    },
  )

  const tokens = data.data
  syncSession({
    token: '',
    refreshToken: '',
    expiresAt: tokens.expiresAt,
    refreshExpiresAt: tokens.refreshExpiresAt,
  })
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

type GlowRequestConfig = InternalAxiosRequestConfig & { _glowLoading?: boolean }

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const glowConfig = config as GlowRequestConfig
  const trackLoading = !isExcludedLoadingPath(config.url)

  try {
    // Modo mockado: intercepta a chamada no adapter, sem tocar na rede real.
    if (MOCK_MODE) {
      const { getMockAdapter } = await import('@/mocks')
      config.adapter = getMockAdapter() as unknown as InternalAxiosRequestConfig['adapter']
    } else if (!isExemptRequestProofPath(config.url)) {
      // Auth via cookie HttpOnly (guc_access); não injeta token no header.
      const proof = await acquireRequestProof(config.method, config.url)
      if (proof && config.headers) {
        config.headers[REQUEST_PROOF_HEADER] = proof
      }
    }

    // Só marca loading depois da preparação — evita overlay preso se o proof falhar.
    if (trackLoading) {
      useLoadingStore().start()
      glowConfig._glowLoading = true
    }

    return config
  } catch (error) {
    if (glowConfig._glowLoading) {
      useLoadingStore().finish()
      glowConfig._glowLoading = false
    }
    return Promise.reject(error)
  }
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

    const ehProfissionalAutonomo = useNegocioStore().ehProfissionalAutonomo
    if (ehProfissionalAutonomo && modulo === 'Profissionais') {
      return true
    }

    const info = getUpgradeInfo(modulo ?? '', ehProfissionalAutonomo)
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
    const cfg = response.config as GlowRequestConfig
    if (cfg._glowLoading) {
      useLoadingStore().finish()
      cfg._glowLoading = false
    }
    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as GlowRequestConfig & {
      _retry?: boolean
      _proofRetry?: boolean
    }
    if (originalRequest?._glowLoading) {
      useLoadingStore().finish()
      originalRequest._glowLoading = false
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
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => api(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await refreshAccessToken(api)
      processQueue(null)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
