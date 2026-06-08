import api from './api'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { ConviteNegocio } from '@/types/convite.types'
import type { CriarConviteProfissionalPayload } from '@/types/negocio/equipe.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const conviteService = {
  criarConviteProfissional(estabelecimentoId: number, payload: CriarConviteProfissionalPayload) {
    return api
      .post<ApiSuccessResponse<ConviteNegocio>>(
        negocioPath(estabelecimentoId, '/convites/profissionais'),
        payload,
      )
      .then(unwrap)
  },

  cancelarConvite(estabelecimentoId: number, conviteId: number) {
    return api
      .delete<ApiSuccessResponse<ConviteNegocio>>(
        negocioPath(estabelecimentoId, `/convites/${conviteId}`),
      )
      .then(unwrap)
  },

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
