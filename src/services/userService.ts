import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  CadastroPayload,
  CadastroResponse,
  ChangePasswordPayload,
  EstabelecimentoAcesso,
  UpdateProfilePayload,
  User,
} from '@/types/user.types'
import type { WhatsAppConfirmacaoInstrucoes, WhatsAppOptInPayload } from '@/types/whatsapp.types'

export const userService = {
  cadastrar(payload: CadastroPayload) {
    return api.post<CadastroResponse>('/usuario', payload)
  },

  me() {
    return api.get<User>('/usuario/me')
  },

  updateMe(payload: UpdateProfilePayload) {
    return api.put('/usuario/me', payload)
  },

  alterarSenha(payload: ChangePasswordPayload) {
    return api.put<ApiSuccessResponse<void>>('/usuario/me/senha', payload)
  },

  meEstabelecimentos() {
    return api.get<EstabelecimentoAcesso[]>('/usuario/me/estabelecimentos')
  },

  solicitarConfirmacaoWhatsApp() {
    return api
      .post<ApiSuccessResponse<WhatsAppConfirmacaoInstrucoes>>(
        '/usuario/me/whatsapp/solicitar-confirmacao',
      )
      .then((response) => response.data.data)
  },

  atualizarWhatsAppOptIn(payload: WhatsAppOptInPayload) {
    return api.post('/usuario/me/whatsapp/opt-in', payload)
  },

  desativarConta() {
    return api.delete('/usuario/me')
  },
}

export type { ApiSuccessResponse } from '@/types/api.types'
