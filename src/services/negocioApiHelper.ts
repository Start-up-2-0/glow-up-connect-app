import type { ApiSuccessResponse } from '@/types/api.types'

export function unwrapApi<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}
