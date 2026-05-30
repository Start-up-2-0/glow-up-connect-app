import api from './api'
import type { ApiSuccessResponse, ApiSuccessResponseVoid } from '@/types/api.types'
import type {
  AuthTokens,
  ConfirmarEmailPayload,
  LoginData,
  LoginPayload,
  RefreshPayload,
  ReenviarConfirmacaoPayload,
} from '@/types/auth.types'

export const authService = {
  login(payload: LoginPayload) {
    return api.post<ApiSuccessResponse<LoginData>>('/auth/login', payload)
  },

  logout() {
    return api.post<ApiSuccessResponseVoid>('/auth/logout')
  },

  refresh(payload: RefreshPayload) {
    return api.post<ApiSuccessResponse<AuthTokens>>('/auth/refresh', payload)
  },

  confirmarEmail(payload: ConfirmarEmailPayload) {
    return api.post<ApiSuccessResponseVoid>('/auth/confirmar-email', payload)
  },

  reenviarConfirmacao(payload: ReenviarConfirmacaoPayload) {
    return api.post<ApiSuccessResponseVoid>('/auth/reenviar-confirmacao', payload)
  },
}
