import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'

export interface AuditoriaRegistro {
  id: number
  estabelecimentoId: number
  usuarioId: number | null
  tipoAcao: string
  entidade: string
  entidadeId: number | null
  payloadJson: string
  criadoEm: string
}

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const auditoriaService = {
  listar(estabelecimentoId: number, limite = 50) {
    return api
      .get<ApiSuccessResponse<AuditoriaRegistro[]>>(
        `/estabelecimentos/${estabelecimentoId}/auditoria`,
        { params: { limite } },
      )
      .then(unwrap)
  },
}
