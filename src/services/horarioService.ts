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

  listarProfissionais(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<HorarioProfissional[]>>(
        negocioPath(estabelecimentoId, '/profissionais/horarios'),
      )
      .then(unwrapApi)
  },
}
