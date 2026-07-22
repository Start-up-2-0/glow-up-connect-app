import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'

export interface RedeUnidadeResumo {
  estabelecimentoId: number
  nome: string
  ehMatriz: boolean
  agendamentosNoPeriodo: number
  faturamentoPeriodo: number
}

export interface RedeResumo {
  assinaturaId: number
  totalUnidades: number
  limiteUnidades: number | null
  totalAgendamentosNoPeriodo: number
  totalFaturamentoPeriodo: number
  unidades: RedeUnidadeResumo[]
}

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const redeService = {
  obterResumo(assinaturaId: number, inicio?: string, fim?: string) {
    return api
      .get<ApiSuccessResponse<RedeResumo>>('/rede/resumo', {
        params: { assinaturaId, inicio, fim },
      })
      .then(unwrap)
  },
}
