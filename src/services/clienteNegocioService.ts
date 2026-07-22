import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'

export interface ClienteNegocio {
  nome: string
  email: string | null
  telefone: string | null
  totalAgendamentos: number
  ultimoAgendamentoEm: string | null
}

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const clienteNegocioService = {
  listar(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<ClienteNegocio[]>>(
        `/estabelecimentos/${estabelecimentoId}/clientes`,
      )
      .then(unwrap)
  },
}
