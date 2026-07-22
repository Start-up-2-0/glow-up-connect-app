import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { HorarioFuncionamento, HorarioPayload, HorarioProfissional } from '@/types/negocio/horario.types'

export const horarioService = {
  listarLoja(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<HorarioFuncionamento[]>>(
        negocioPath(estabelecimentoId, '/horarios-funcionamento'),
      )
      .then(unwrapApi)
  },

  criarLoja(estabelecimentoId: number, payload: HorarioPayload) {
    return api
      .post<ApiSuccessResponse<HorarioFuncionamento>>(
        negocioPath(estabelecimentoId, '/horarios-funcionamento'),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarLoja(estabelecimentoId: number, horarioId: number, payload: HorarioPayload) {
    return api
      .put<ApiSuccessResponse<HorarioFuncionamento>>(
        negocioPath(estabelecimentoId, `/horarios-funcionamento/${horarioId}`),
        payload,
      )
      .then(unwrapApi)
  },

  alterarStatusLoja(estabelecimentoId: number, horarioId: number, ativo: boolean) {
    return api
      .patch<ApiSuccessResponse<HorarioFuncionamento>>(
        negocioPath(estabelecimentoId, `/horarios-funcionamento/${horarioId}/status`),
        { ativo },
      )
      .then(unwrapApi)
  },

  listarProfissionais(
    estabelecimentoId: number,
    filtros?: { profissionalId?: number; diaSemana?: string; ativo?: boolean },
  ) {
    return api
      .get<ApiSuccessResponse<HorarioProfissional[]>>(
        negocioPath(estabelecimentoId, '/profissionais/horarios'),
        { params: filtros },
      )
      .then(unwrapApi)
  },

  criarProfissional(
    estabelecimentoId: number,
    profissionalId: number,
    payload: HorarioPayload,
  ) {
    return api
      .post<ApiSuccessResponse<HorarioProfissional>>(
        negocioPath(estabelecimentoId, `/profissionais/${profissionalId}/horarios`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarProfissional(estabelecimentoId: number, horarioId: number, payload: HorarioPayload) {
    return api
      .put<ApiSuccessResponse<HorarioProfissional>>(
        negocioPath(estabelecimentoId, `/profissionais/horarios/${horarioId}`),
        payload,
      )
      .then(unwrapApi)
  },

  alterarStatusProfissional(estabelecimentoId: number, horarioId: number, ativo: boolean) {
    return api
      .patch<ApiSuccessResponse<HorarioProfissional>>(
        negocioPath(estabelecimentoId, `/profissionais/horarios/${horarioId}/status`),
        { ativo },
      )
      .then(unwrapApi)
  },
}
