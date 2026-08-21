import api from './api'
import type { ApiSuccessResponseVoid } from '@/types/api.types'
import type { ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth.types'

export const recoveryService = {
  forgotPassword(payload: ForgotPasswordRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/forgot-password', payload)
  },

  resetPassword(payload: ResetPasswordRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/reset-password', payload)
  },
}
