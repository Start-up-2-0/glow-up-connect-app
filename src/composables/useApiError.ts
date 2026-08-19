import type { AxiosError } from 'axios'
import {
  isApiErrorResponse,
  isValidationProblemDetails,
  type ApiErrorResponse,
} from '@/types/api.types'
import { DEFAULT_ERROR_MESSAGE, getApiErrorMessage } from '@/constants/apiErrors'
import { isChunkLoadError } from '@/utils/chunkLoadError'

export function useApiError() {
  function resolveErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined

    const axiosError = error as AxiosError<ApiErrorResponse>
    const data = axiosError.response?.data

    if (isApiErrorResponse(data)) {
      return data.code
    }

    return undefined
  }

  function resolveError(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
    if (isChunkLoadError(error)) {
      return 'A aplicação foi atualizada. Recarregue a página para continuar.'
    }

    if (!error || typeof error !== 'object') return fallback

    const axiosError = error as AxiosError<unknown>
    const data = axiosError.response?.data

    if (isApiErrorResponse(data)) {
      return getApiErrorMessage(data.code, data.message || fallback)
    }

    if (isValidationProblemDetails(data)) {
      const firstField = Object.values(data.errors ?? {})
        .flat()
        .find((message): message is string => typeof message === 'string')
      if (firstField) return firstField
    }

    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: string }).message
      if (message) return message
    }

    if (axiosError.message) return axiosError.message

    return fallback
  }

  function resolveFieldErrors(error: unknown): Record<string, string[]> {
    if (!error || typeof error !== 'object') return {}

    const axiosError = error as AxiosError<unknown>
    const data = axiosError.response?.data

    if (isValidationProblemDetails(data)) {
      return data.errors ?? {}
    }

    if (isApiErrorResponse(data) && data.details && typeof data.details === 'object') {
      return data.details as Record<string, string[]>
    }

    return {}
  }

  function resolveErrorDetails<T = unknown>(error: unknown): T | undefined {
    if (!error || typeof error !== 'object') return undefined

    const axiosError = error as AxiosError<ApiErrorResponse>
    const data = axiosError.response?.data

    if (isApiErrorResponse(data) && data.details != null) {
      return data.details as T
    }

    return undefined
  }

  return { resolveError, resolveErrorCode, resolveFieldErrors, resolveErrorDetails }
}
