import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { ConviteNegocio } from '@/types/convite.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const conviteService = {
  aceitar(token: string) {
    return api
      .post<ApiSuccessResponse<ConviteNegocio>>(`/convites/${encodeURIComponent(token)}/aceitar`)
      .then(unwrap)
  },

  rejeitar(token: string) {
    return api
      .post<ApiSuccessResponse<ConviteNegocio>>(`/convites/${encodeURIComponent(token)}/rejeitar`)
      .then(unwrap)
  },
}
