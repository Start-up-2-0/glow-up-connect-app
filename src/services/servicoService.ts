import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AtualizarVinculoServicoProfissionalPayload,
  ProfissionalServicoVinculo,
  Servico,
  ServicoFiltro,
  ServicoPayload,
  VincularServicoProfissionalPayload,
} from '@/types/negocio/servico.types'

export const servicoService = {
  listar(estabelecimentoId: number, filtro?: ServicoFiltro) {
    return api
      .get<ApiSuccessResponse<Servico[]>>(negocioPath(estabelecimentoId, '/servicos'), { params: filtro })
      .then(unwrapApi)
  },

  criar(estabelecimentoId: number, payload: ServicoPayload) {
    return api
      .post<ApiSuccessResponse<Servico>>(negocioPath(estabelecimentoId, '/servicos'), payload)
      .then(unwrapApi)
  },

  atualizar(estabelecimentoId: number, servicoId: number, payload: ServicoPayload) {
    return api
      .put<ApiSuccessResponse<Servico>>(
        negocioPath(estabelecimentoId, `/servicos/${servicoId}`),
        payload,
      )
      .then(unwrapApi)
  },

  alterarStatus(estabelecimentoId: number, servicoId: number, ativo: boolean) {
    return api
      .patch<ApiSuccessResponse<Servico>>(
        negocioPath(estabelecimentoId, `/servicos/${servicoId}/status`),
        { ativo },
      )
      .then(unwrapApi)
  },

  vincularProfissional(
    estabelecimentoId: number,
    servicoId: number,
    profissionalId: number,
    payload: VincularServicoProfissionalPayload = {},
  ) {
    return api
      .post<ApiSuccessResponse<ProfissionalServicoVinculo>>(
        negocioPath(estabelecimentoId, `/servicos/${servicoId}/profissionais/${profissionalId}`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarVinculoProfissional(
    estabelecimentoId: number,
    servicoId: number,
    profissionalId: number,
    payload: AtualizarVinculoServicoProfissionalPayload,
  ) {
    return api
      .put<ApiSuccessResponse<ProfissionalServicoVinculo>>(
        negocioPath(estabelecimentoId, `/servicos/${servicoId}/profissionais/${profissionalId}`),
        payload,
      )
      .then(unwrapApi)
  },

  desvincularProfissional(estabelecimentoId: number, servicoId: number, profissionalId: number) {
    return api
      .patch<ApiSuccessResponse<ProfissionalServicoVinculo>>(
        negocioPath(estabelecimentoId, `/servicos/${servicoId}/profissionais/${profissionalId}/status`),
      )
      .then(unwrapApi)
  },
}
