import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AgendamentoCliente,
  AgendamentoFiltro,
  AgendamentosPaginados,
  CancelarAgendamentoPayload,
  CriarAgendamentoPayload,
  RemarcarAgendamentoPayload,
} from '@/types/agendamento.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const agendamentoService = {
  criar(payload: CriarAgendamentoPayload) {
    return api
      .post<ApiSuccessResponse<AgendamentoCliente>>('/agendamentos', payload)
      .then(unwrap)
  },

  listarMeus(filtro: AgendamentoFiltro = {}) {
    return api
      .get<ApiSuccessResponse<AgendamentosPaginados>>('/agendamentos/me', { params: filtro })
      .then(unwrap)
  },

  obterMeu(id: number) {
    return api
      .get<ApiSuccessResponse<AgendamentoCliente>>(`/agendamentos/me/${id}`)
      .then(unwrap)
  },

  cancelar(id: number, payload: CancelarAgendamentoPayload) {
    return api
      .post<ApiSuccessResponse<AgendamentoCliente>>(`/agendamentos/me/${id}/cancelar`, payload)
      .then(unwrap)
  },

  remarcar(id: number, payload: RemarcarAgendamentoPayload) {
    return api
      .post<ApiSuccessResponse<AgendamentoCliente>>(`/agendamentos/me/${id}/remarcar`, payload)
      .then(unwrap)
  },

  aceitarPropostaRemarcacao(agendamentoId: number, propostaId: number) {
    return api
      .post<ApiSuccessResponse<AgendamentoCliente>>(
        `/agendamentos/me/${agendamentoId}/propostas-remarcacao/${propostaId}/aceitar`,
      )
      .then(unwrap)
  },
}
