import api from './api'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ConviteCriado,
  ConviteNegocio,
  ConvitePreview,
  CriarConviteLinkPayload,
  StatusConviteFiltro,
} from '@/types/convite.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const conviteService = {
  criarLink(estabelecimentoId: number, payload: CriarConviteLinkPayload) {
    return api
      .post<ApiSuccessResponse<ConviteCriado>>(
        negocioPath(estabelecimentoId, '/convites'),
        payload,
      )
      .then(unwrap)
  },

  obterPreview(token: string) {
    return api
      .get<ApiSuccessResponse<ConvitePreview>>(
        `/publico/convites/${encodeURIComponent(token)}/preview`,
      )
      .then(unwrap)
  },

  listarConvites(estabelecimentoId: number, status?: StatusConviteFiltro) {
    return api
      .get<ApiSuccessResponse<ConviteNegocio[]>>(
        negocioPath(estabelecimentoId, '/convites'),
        { params: status ? { status } : undefined },
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
      .post<ApiSuccessResponse<ConviteNegocio>>(
        `/publico/convites/${encodeURIComponent(token)}/aceitar`,
      )
      .then(unwrap)
  },
}
