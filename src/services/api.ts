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
  readStoredSession,
  setAccessToken,
} from '@/utils/storage'
import { syncSession } from '@/utils/sessionSync'

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

function shouldAttemptRefresh(error: AxiosError<ApiErrorResponse>, url?: string) {
  if (error.response?.status !== 401) return false
  if (!url) return false
  if (url.includes('/auth/login') || url.includes('/auth/refresh')) return false

  const code = error.response.data?.code
  return !code || code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN' || code === 'UNAUTHORIZED'
}

function redirectToLogin() {
  clearSessionStorage()
  const isAuthRoute = window.location.pathname.startsWith('/auth')
  if (!isAuthRoute) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `${ROUTE_PATHS.LOGIN}?redirect=${redirect}`
  }
}

async function refreshAccessToken(client: AxiosInstance): Promise<string> {
  const { refreshToken } = readStoredSession()
  if (!refreshToken) {
    throw new Error('Refresh token ausente')
  }

  const { data } = await client.post<{ success: boolean; data: AuthTokens }>(
    '/auth/refresh',
    { refreshToken },
    { headers: { [TOKEN_HEADER]: undefined } },
  )

  const tokens = data.data
  syncSession(tokens)
  return tokens.token
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers[TOKEN_HEADER] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const requestUrl = originalRequest?.url

    if (!originalRequest || !shouldAttemptRefresh(error, requestUrl)) {
      if (error.response?.status === 401 && !requestUrl?.includes('/auth/login')) {
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
