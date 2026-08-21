import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AvaliacaoContexto,
  AvaliacaoResumoPublico,
  AvaliacoesNegocioPaginadas,
  AvaliacoesPaginadas,
  CriarAvaliacaoPayload,
} from '@/types/avaliacao.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const avaliacaoService = {
  obterContextoMeuAgendamento(agendamentoId: number) {
    return api
      .get<ApiSuccessResponse<AvaliacaoContexto>>(`/agendamentos/me/${agendamentoId}/avaliacao`)
      .then(unwrap)
  },

  criarMeuAgendamento(agendamentoId: number, payload: CriarAvaliacaoPayload) {
    return api
      .post<ApiSuccessResponse<AvaliacaoContexto>>(
        `/agendamentos/me/${agendamentoId}/avaliacao`,
        payload,
      )
      .then(unwrap)
  },

  obterContextoPorToken(token: string) {
    return api
      .get<ApiSuccessResponse<AvaliacaoContexto>>(`/publico/avaliacoes/${token}`)
      .then(unwrap)
  },

  criarPorToken(token: string, payload: CriarAvaliacaoPayload) {
    return api
      .post<ApiSuccessResponse<AvaliacaoContexto>>(`/publico/avaliacoes/${token}`, payload)
      .then(unwrap)
  },

  listarEstabelecimento(publicGuid: string, pagina = 1, tamanhoPagina = 10) {
    return api
      .get<ApiSuccessResponse<AvaliacoesPaginadas>>(
        `/publico/avaliacoes/estabelecimentos/${publicGuid}`,
        { params: { pagina, tamanhoPagina } },
      )
      .then(unwrap)
  },

  obterResumoNegocio(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<AvaliacaoResumoPublico>>(
        `/estabelecimentos/${estabelecimentoId}/avaliacoes/resumo`,
      )
      .then(unwrap)
  },

  listarNegocio(estabelecimentoId: number, pagina = 1, tamanhoPagina = 10) {
    return api
      .get<ApiSuccessResponse<AvaliacoesNegocioPaginadas>>(
        `/estabelecimentos/${estabelecimentoId}/avaliacoes`,
        { params: { pagina, tamanhoPagina } },
      )
      .then(unwrap)
  },
}
