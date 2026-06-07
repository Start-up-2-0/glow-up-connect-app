import api from './api'
import type { ApiSuccessResponse, ApiSuccessResponseVoid } from '@/types/api.types'
import type {
  Assinatura,
  CobrancaAssinatura,
  CriarAssinaturaPayload,
  TrocarPlanoPayload,
} from '@/types/assinatura.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const assinaturaService = {
  criar(payload: CriarAssinaturaPayload) {
    return api.post<ApiSuccessResponse<Assinatura>>('/assinaturas', payload).then(unwrap)
  },

  trocarPlano(assinaturaId: number, payload: TrocarPlanoPayload) {
    return api
      .post<ApiSuccessResponse<Assinatura>>(`/assinaturas/${assinaturaId}/trocar-plano`, payload)
      .then(unwrap)
  },

  cancelar(assinaturaId: number) {
    return api
      .post<ApiSuccessResponseVoid>(`/assinaturas/${assinaturaId}/cancelar`)
      .then((response) => response.data)
  },

  listarCobrancas(assinaturaId: number) {
    return api
      .get<ApiSuccessResponse<CobrancaAssinatura[]>>(`/assinaturas/${assinaturaId}/cobrancas`)
      .then(unwrap)
  },
}
