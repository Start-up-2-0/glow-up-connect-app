import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { PlanosResponse } from '@/types/plano.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const planoService = {
  listar() {
    return api.get<ApiSuccessResponse<PlanosResponse>>('/planos').then(unwrap)
  },
}
