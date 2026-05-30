import { isAxiosError } from 'axios'
import { recoveryService } from '@/services/recoveryService'
import { isApiErrorResponse } from '@/types/api.types'
import { useForgotPasswordMock } from './useForgotPasswordMock'

export { PASSWORD_RULES, getUnmetPasswordRules, maskEmail } from '@/utils/passwordRules'

function isNotImplemented(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  const data = error.response?.data
  return status === 501 || (isApiErrorResponse(data) && data.code === 'NOT_IMPLEMENTED')
}

function isRateLimitedError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const data = error.response?.data
  return isApiErrorResponse(data) && data.code === 'RESET_CODIGO_INVALIDO'
}

export function useForgotPassword() {
  const mock = useForgotPasswordMock()

  async function sendCode(
    email: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      await recoveryService.forgotPassword({ email: email.trim() })
      sessionStorage.setItem('guc_recovery_email', email.trim())
      return { ok: true }
    } catch (err) {
      if (isNotImplemented(err)) return mock.sendCode(email)
      return { ok: false, error: 'Não foi possível enviar o código. Tente novamente.' }
    }
  }

  async function resendCode(): Promise<
    { ok: true; rateLimited: false } | { ok: false; rateLimited: true }
  > {
    const email = mock.getStoredEmail()
    if (!email) return { ok: false, rateLimited: true }

    try {
      await recoveryService.resendResetCode({ email })
      return { ok: true, rateLimited: false }
    } catch (err) {
      if (isNotImplemented(err)) return mock.resendCode()
      return { ok: false, rateLimited: true }
    }
  }

  async function requestNewCode(): Promise<void> {
    try {
      const email = mock.getStoredEmail()
      if (email) {
        await recoveryService.forgotPassword({ email })
      }
      mock.resetRateLimit()
    } catch (err) {
      if (isNotImplemented(err)) {
        await mock.requestNewCode()
        return
      }
      throw err
    }
  }

  async function verifyCode(code: string): Promise<{
    valid: boolean
    rateLimited: boolean
    invalid: boolean
  }> {
    const email = mock.getStoredEmail()
    if (!email) {
      return { valid: false, rateLimited: false, invalid: true }
    }

    try {
      await recoveryService.verifyResetCode({ email, codigo: code })
      mock.resetCodeAttempts()
      return { valid: true, rateLimited: false, invalid: false }
    } catch (err) {
      if (isNotImplemented(err)) return mock.verifyCode(code)

      if (isRateLimitedError(err)) {
        return { valid: false, rateLimited: true, invalid: true }
      }

      return { valid: false, rateLimited: false, invalid: true }
    }
  }

  function validatePassword(senha: string, confirmarSenha: string): {
    valid: boolean
    mismatch: boolean
    requirements: string[]
  } {
    return mock.validatePassword(senha, confirmarSenha)
  }

  async function resetPassword(payload: {
    senha: string
    confirmarSenha: string
  }): Promise<boolean> {
    const email = mock.getStoredEmail()
    if (!email) {
      throw new Error('Sessão de recuperação expirada.')
    }

    try {
      await recoveryService.resetPassword({
        email,
        senha: payload.senha,
        confirmarSenha: payload.confirmarSenha,
      })
      mock.clearRecoverySession()
      return true
    } catch (err) {
      if (isNotImplemented(err)) {
        await mock.resetPassword(payload.senha)
        return true
      }
      throw err
    }
  }

  return {
    RESEND_COOLDOWN_SECONDS: mock.RESEND_COOLDOWN_SECONDS,
    getStoredEmail: mock.getStoredEmail,
    clearRecoverySession: mock.clearRecoverySession,
    getResendCount: mock.getResendCount,
    getCodeAttempts: mock.getCodeAttempts,
    sendCode,
    resendCode,
    resetResendLimit: mock.resetResendLimit,
    resetRateLimit: mock.resetRateLimit,
    requestNewCode,
    verifyCode,
    validatePassword,
    resetPassword,
  }
}
