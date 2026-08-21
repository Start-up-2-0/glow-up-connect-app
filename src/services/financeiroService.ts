import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import {
  createEmptyFinanceiroDashboard,
  isFinanceiroDashboardEmptyResponse,
} from '@/utils/financeiroDashboard'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  CriarMovimentoPayload,
  FinanceiroDashboard,
  FinanceiroPeriodoFiltro,
  MovimentoFinanceiro,
  MovimentosFinanceirosFiltro,
  MovimentosFinanceirosPaginado,
} from '@/types/negocio/financeiro.types'
import type { BaixarContaPayload } from '@/types/negocio/caixa.types'

export const financeiroService = {
  async obterDashboard(estabelecimentoId: number, filtro?: FinanceiroPeriodoFiltro) {
    try {
      return await api
        .get<ApiSuccessResponse<FinanceiroDashboard>>(
          negocioPath(estabelecimentoId, '/financeiro/dashboard'),
          { params: filtro },
        )
        .then(unwrapApi)
    } catch (error) {
      if (isFinanceiroDashboardEmptyResponse(error)) {
        return createEmptyFinanceiroDashboard(filtro)
      }
      throw error
    }
  },

  listarEntradas(estabelecimentoId: number, filtro?: MovimentosFinanceirosFiltro) {
    return api
      .get<ApiSuccessResponse<MovimentosFinanceirosPaginado>>(
        negocioPath(estabelecimentoId, '/financeiro/entradas'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  listarSaidas(estabelecimentoId: number, filtro?: MovimentosFinanceirosFiltro) {
    return api
      .get<ApiSuccessResponse<MovimentosFinanceirosPaginado>>(
        negocioPath(estabelecimentoId, '/financeiro/saidas'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  criarEntrada(estabelecimentoId: number, payload: CriarMovimentoPayload) {
    return api
      .post<ApiSuccessResponse<MovimentoFinanceiro>>(
        negocioPath(estabelecimentoId, '/financeiro/entradas'),
        payload,
      )
      .then(unwrapApi)
  },

  criarSaida(estabelecimentoId: number, payload: CriarMovimentoPayload) {
    return api
      .post<ApiSuccessResponse<MovimentoFinanceiro>>(
        negocioPath(estabelecimentoId, '/financeiro/saidas'),
        payload,
      )
      .then(unwrapApi)
  },

  marcarEntradaRecebida(
    estabelecimentoId: number,
    movimentoId: string,
    payload?: BaixarContaPayload,
  ) {
    return api
      .patch<ApiSuccessResponse<MovimentoFinanceiro>>(
        negocioPath(estabelecimentoId, `/financeiro/entradas/${encodeURIComponent(movimentoId)}/receber`),
        payload ?? {},
      )
      .then(unwrapApi)
  },

  marcarSaidaPaga(
    estabelecimentoId: number,
    movimentoId: string,
    payload?: BaixarContaPayload,
  ) {
    return api
      .patch<ApiSuccessResponse<MovimentoFinanceiro>>(
        negocioPath(estabelecimentoId, `/financeiro/saidas/${encodeURIComponent(movimentoId)}/pagar`),
        payload ?? {},
      )
      .then(unwrapApi)
  },
}
