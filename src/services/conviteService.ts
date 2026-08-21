import api from './api'
import { negocioPath } from '@/utils/negocioApi'
import { convitePublicoUrl } from '@/utils/landingUrl'
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

function normalizarLinkConvite(criado: ConviteCriado): ConviteCriado {
  return {
    ...criado,
    // Homolog/prod: API pode vir com LandingBaseUrl de localhost; o app usa VITE_LANDING_URL.
    linkConvite: convitePublicoUrl(criado.linkConvite),
  }
}

export const conviteService = {
  criarLink(estabelecimentoId: number, payload: CriarConviteLinkPayload) {
    return api
      .post<ApiSuccessResponse<ConviteCriado>>(
        negocioPath(estabelecimentoId, '/convites'),
        payload,
      )
      .then(unwrap)
      .then(normalizarLinkConvite)
  },

  obterLink(estabelecimentoId: number, conviteId: number) {
    return api
      .get<ApiSuccessResponse<ConviteCriado>>(
        negocioPath(estabelecimentoId, `/convites/${conviteId}/link`),
      )
      .then(unwrap)
      .then(normalizarLinkConvite)
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
