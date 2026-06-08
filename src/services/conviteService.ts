import api from './api'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ConviteCriado,
  ConviteNegocio,
  ConvitePreview,
  StatusConviteFiltro,
} from '@/types/convite.types'
import type {
  CriarConviteProfissionalPayload,
  CriarConviteUsuarioEquipePayload,
} from '@/types/negocio/equipe.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const conviteService = {
  criarConviteProfissional(estabelecimentoId: number, payload: CriarConviteProfissionalPayload) {
    return api
      .post<ApiSuccessResponse<ConviteCriado>>(
        negocioPath(estabelecimentoId, '/convites/profissionais'),
        payload,
      )
      .then(unwrap)
  },

  criarConviteUsuario(estabelecimentoId: number, payload: CriarConviteUsuarioEquipePayload) {
    return api
      .post<ApiSuccessResponse<ConviteCriado>>(
        negocioPath(estabelecimentoId, '/convites/usuarios'),
        payload,
      )
      .then(unwrap)
  },

  obterPreview(token: string) {
    return api
      .get<ApiSuccessResponse<ConvitePreview>>(
        `/convites/${encodeURIComponent(token)}/preview`,
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
      .post<ApiSuccessResponse<ConviteNegocio>>(`/convites/${encodeURIComponent(token)}/aceitar`)
      .then(unwrap)
  },

  rejeitar(token: string) {
    return api
      .post<ApiSuccessResponse<ConviteNegocio>>(`/convites/${encodeURIComponent(token)}/rejeitar`)
      .then(unwrap)
  },
}
