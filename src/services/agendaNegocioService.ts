import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AgendaFiltro,
  AgendaGeral,
  AgendaProfissional,
  AgendamentoHistorico,
} from '@/types/negocio/agenda.types'

export const agendaNegocioService = {
  listarGeral(estabelecimentoId: number, filtro?: AgendaFiltro) {
    return api
      .get<ApiSuccessResponse<AgendaGeral[]>>(negocioPath(estabelecimentoId, '/agenda'), { params: filtro })
      .then(unwrapApi)
  },

  listarPropria(estabelecimentoId: number, filtro?: AgendaFiltro) {
    return api
      .get<ApiSuccessResponse<AgendaProfissional[]>>(
        negocioPath(estabelecimentoId, '/agenda/propria'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  confirmar(estabelecimentoId: number, agendamentoId: number) {
    return api
      .post(negocioPath(estabelecimentoId, `/agendamentos/${agendamentoId}/confirmar`))
      .then(unwrapApi)
  },

  cancelar(estabelecimentoId: number, agendamentoId: number, motivo: string) {
    return api
      .post(negocioPath(estabelecimentoId, `/agendamentos/${agendamentoId}/cancelar`), { motivo })
      .then(unwrapApi)
  },

  historico(estabelecimentoId: number, agendamentoId: number) {
    return api
      .get<ApiSuccessResponse<AgendamentoHistorico[]>>(
        negocioPath(estabelecimentoId, `/agendamentos/${agendamentoId}/historico`),
      )
      .then(unwrapApi)
  },

  iniciarAtendimento(estabelecimentoId: number, agendamentoItemId: number) {
    return api
      .post(negocioPath(estabelecimentoId, `/atendimentos/${agendamentoItemId}/iniciar`))
      .then(unwrapApi)
  },

  finalizarAtendimento(estabelecimentoId: number, agendamentoItemId: number) {
    return api
      .post(negocioPath(estabelecimentoId, `/atendimentos/${agendamentoItemId}/finalizar`))
      .then(unwrapApi)
  },
}
