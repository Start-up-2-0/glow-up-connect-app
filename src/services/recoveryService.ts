import api from './api'
import type { ApiSuccessResponseVoid } from '@/types/api.types'
import type {
  ForgotPasswordRequest,
  ResendResetCodeRequest,
  ResetPasswordRequest,
  VerifyResetCodeRequest,
} from '@/types/auth.types'

export const recoveryService = {
  forgotPassword(payload: ForgotPasswordRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/forgot-password', payload)
  },

  verifyResetCode(payload: VerifyResetCodeRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/verify-reset-code', payload)
  },

  resetPassword(payload: ResetPasswordRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/reset-password', payload)
  },

  resendResetCode(payload: ResendResetCodeRequest) {
    return api.post<ApiSuccessResponseVoid>('/auth/resend-reset-code', payload)
  },
}
