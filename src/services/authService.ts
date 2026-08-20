import api from './api'
import type { ApiSuccessResponse, ApiSuccessResponseVoid } from '@/types/api.types'
import type {
  AuthTokens,
  ConfirmarEmailPayload,
  LoginData,
  LoginPayload,
  ReenviarConfirmacaoPayload,
} from '@/types/auth.types'

export const authService = {
  login(payload: LoginPayload) {
    return api.post<ApiSuccessResponse<LoginData>>('/auth/login', payload)
  },

  logout() {
    return api.post<ApiSuccessResponseVoid>('/auth/logout')
  },

  refresh() {
    return api.post<ApiSuccessResponse<AuthTokens>>('/auth/refresh', {}, { withCredentials: true })
  },

  confirmarEmail(payload: ConfirmarEmailPayload) {
    return api.post<ApiSuccessResponseVoid>('/auth/confirmar-email', payload)
  },

  reenviarConfirmacao(payload: ReenviarConfirmacaoPayload) {
    return api.post<ApiSuccessResponseVoid>('/auth/reenviar-confirmacao', payload)
  },

  reenviarConfirmacaoWhatsApp(payload: ReenviarConfirmacaoPayload) {
    return api.post<ApiSuccessResponseVoid>('/auth/reenviar-confirmacao-whatsapp', payload)
  },

  reativarConta(payload: LoginPayload) {
    return api.post<ApiSuccessResponse<LoginData>>('/auth/reativar-conta', payload)
  },
}
