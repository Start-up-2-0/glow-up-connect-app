import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  CaixaResumo,
  ComissaoProfissional,
  FinanceiroResumo,
  LancamentoCaixa,
  LancamentoCaixaFiltro,
} from '@/types/negocio/caixa.types'

export const caixaService = {
  obterResumo(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<CaixaResumo>>(negocioPath(estabelecimentoId, '/caixa'))
      .then(unwrapApi)
  },

  listarLancamentos(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<LancamentoCaixa[]>>(
        negocioPath(estabelecimentoId, '/caixa/lancamentos'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  obterFinanceiroResumo(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<FinanceiroResumo>>(
        negocioPath(estabelecimentoId, '/financeiro/resumo'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  listarRelatorioFinanceiro(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<LancamentoCaixa[]>>(
        negocioPath(estabelecimentoId, '/financeiro/relatorios'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  listarComissoes(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<ComissaoProfissional[]>>(
        negocioPath(estabelecimentoId, '/financeiro/comissoes'),
      )
      .then(unwrapApi)
  },
}
