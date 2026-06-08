import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AtualizarProfissionalVitrinePayload,
  AtualizarStatusProfissionalVitrinePayload,
  CadastrarProfissionalVitrinePayload,
  ProfissionalVitrine,
} from '@/types/negocio/profissionalVitrine.types'

export const profissionalVitrineService = {
  listar(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<ProfissionalVitrine[]>>(
        negocioPath(estabelecimentoId, '/profissionais/vitrine'),
      )
      .then(unwrapApi)
  },

  cadastrar(estabelecimentoId: number, payload: CadastrarProfissionalVitrinePayload) {
    return api
      .post<ApiSuccessResponse<ProfissionalVitrine>>(
        negocioPath(estabelecimentoId, '/profissionais/vitrine'),
        payload,
      )
      .then(unwrapApi)
  },

  atualizar(
    estabelecimentoId: number,
    profissionalId: number,
    payload: AtualizarProfissionalVitrinePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<ProfissionalVitrine>>(
        negocioPath(estabelecimentoId, `/profissionais/vitrine/${profissionalId}`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarStatus(
    estabelecimentoId: number,
    profissionalId: number,
    payload: AtualizarStatusProfissionalVitrinePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<ProfissionalVitrine>>(
        negocioPath(estabelecimentoId, `/profissionais/vitrine/${profissionalId}/status`),
        payload,
      )
      .then(unwrapApi)
  },
}
