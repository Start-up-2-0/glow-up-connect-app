import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  Assinatura,
  AdicionarEstabelecimentoPayload,
  AdicionarEstabelecimentoResponse,
  CobrancaAssinatura,
  CriarAssinaturaPayload,
  TrocarPlanoPayload,
} from '@/types/assinatura.types'
import type { AssinaturaOnboardingContexto } from '@/types/assinaturaOnboarding.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const assinaturaService = {
  obterContextoOnboarding() {
    return api
      .get<ApiSuccessResponse<AssinaturaOnboardingContexto>>('/assinaturas/onboarding/contexto')
      .then(unwrap)
  },

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
      .post<ApiSuccessResponse<Assinatura>>(`/assinaturas/${assinaturaId}/cancelar`)
      .then(unwrap)
  },

  listarCobrancas(assinaturaId: number) {
    return api
      .get<ApiSuccessResponse<CobrancaAssinatura[]>>(`/assinaturas/${assinaturaId}/cobrancas`)
      .then(unwrap)
  },

  obterAtual(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<Assinatura>>('/assinaturas/atual', {
        params: { estabelecimentoId },
      })
      .then(unwrap)
  },

  adicionarEstabelecimento(assinaturaId: number, payload: AdicionarEstabelecimentoPayload) {
    return api
      .post<ApiSuccessResponse<AdicionarEstabelecimentoResponse>>(
        `/assinaturas/${assinaturaId}/estabelecimentos`,
        payload,
      )
      .then(unwrap)
  },
}
