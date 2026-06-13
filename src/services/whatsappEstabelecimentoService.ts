import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'
import { negocioPath } from '@/utils/negocioApi'

export interface EstabelecimentoPerfil {
  id: number
  publicGuid: string
  nome: string
  logo: string
  telefone: string
  email: string
  whatsAppConfirmado: boolean
  whatsAppOptIn: boolean
  whatsAppPendenteConfirmacao: boolean
}

export const whatsappEstabelecimentoService = {
  obterPerfil(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<EstabelecimentoPerfil>>(negocioPath(estabelecimentoId, '/perfil'))
      .then((response) => response.data.data)
  },

  solicitarConfirmacao(estabelecimentoId: number) {
    return api
      .post<ApiSuccessResponse<WhatsAppConfirmacaoInstrucoes>>(
        negocioPath(estabelecimentoId, '/whatsapp/solicitar-confirmacao'),
      )
      .then((response) => response.data.data)
  },

  atualizarOptIn(estabelecimentoId: number, optIn: boolean) {
    return api.post(negocioPath(estabelecimentoId, '/whatsapp/opt-in'), { optIn })
  },
}
