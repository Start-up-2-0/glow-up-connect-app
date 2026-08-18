import { isAxiosError } from 'axios'
import { recoveryService } from '@/services/recoveryService'
import { isApiErrorResponse } from '@/types/api.types'
import { getUnmetPasswordRules } from '@/utils/passwordRules'

export { PASSWORD_RULES, getUnmetPasswordRules, maskEmail } from '@/utils/passwordRules'

const STORAGE_EMAIL_KEY = 'guc_recovery_email'
const STORAGE_CODE_KEY = 'guc_recovery_codigo'
const RESEND_COOLDOWN_SECONDS = 60
const CODE_LENGTH = 6

const DEFAULT_FORGOT_MESSAGE =
  'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.'

function isRateLimitedError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  return error.response?.status === 429
}

export function useForgotPassword() {
  function setStoredEmail(email: string) {
    sessionStorage.setItem(STORAGE_EMAIL_KEY, email.trim())
  }

  function getStoredEmail(): string | null {
    return sessionStorage.getItem(STORAGE_EMAIL_KEY)
  }

  function setStoredCode(codigo: string) {
    sessionStorage.setItem(STORAGE_CODE_KEY, codigo)
  }

  function getStoredCode(): string | null {
    return sessionStorage.getItem(STORAGE_CODE_KEY)
  }

  function clearRecoverySession() {
    sessionStorage.removeItem(STORAGE_EMAIL_KEY)
    sessionStorage.removeItem(STORAGE_CODE_KEY)
  }

  function normalizeCode(codigo: string): string {
    return codigo.replace(/\D/g, '').slice(0, CODE_LENGTH)
  }

  async function sendCode(
    email: string,
  ): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
    const trimmed = email.trim()
    if (!trimmed) {
      return { ok: false, error: 'Informe o e-mail da sua conta.' }
    }

    try {
      const { data } = await recoveryService.forgotPassword({
        email: trimmed.toLowerCase(),
      })
      setStoredEmail(trimmed)
      sessionStorage.removeItem(STORAGE_CODE_KEY)
      const message =
        data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
          ? data.message
          : DEFAULT_FORGOT_MESSAGE
      return { ok: true, message }
    } catch {
      return { ok: false, error: 'Não foi possível enviar o código. Tente novamente.' }
    }
  }

  async function resendCode(): Promise<{ ok: true } | { ok: false; rateLimited: boolean }> {
    const email = getStoredEmail()
    if (!email) return { ok: false, rateLimited: false }

    try {
      await recoveryService.forgotPassword({ email: email.toLowerCase() })
      return { ok: true }
    } catch (err) {
      return { ok: false, rateLimited: isRateLimitedError(err) }
    }
  }

  function rememberCode(codigo: string): { ok: true } | { ok: false; invalid: true } {
    const normalized = normalizeCode(codigo)
    if (normalized.length !== CODE_LENGTH) {
      return { ok: false, invalid: true }
    }

    setStoredCode(normalized)
    return { ok: true }
  }

  function validatePassword(
    senha: string,
    confirmarSenha: string,
  ): {
    valid: boolean
    mismatch: boolean
    requirements: string[]
  } {
    const requirements = getUnmetPasswordRules(senha)
    const mismatch = senha !== confirmarSenha

    return {
      valid: requirements.length === 0 && !mismatch,
      mismatch,
      requirements,
    }
  }

  async function resetPassword(payload: {
    senha: string
    confirmarSenha: string
    token?: string
  }): Promise<boolean> {
    const token = payload.token?.trim()
    const codigo = getStoredCode()

    if (!token && !codigo) {
      throw new Error('Sessão de recuperação expirada.')
    }

    await recoveryService.resetPassword({
      ...(token ? { token } : { codigo: codigo ?? undefined }),
      senha: payload.senha,
      confirmarSenha: payload.confirmarSenha,
    })
    clearRecoverySession()
    return true
  }

  function isResetInvalid(error: unknown): boolean {
    if (!isAxiosError(error)) return false
    const data = error.response?.data
    return isApiErrorResponse(data) && data.code === 'RESET_SENHA_INVALIDO'
  }

  return {
    RESEND_COOLDOWN_SECONDS,
    getStoredEmail,
    getStoredCode,
    clearRecoverySession,
    sendCode,
    resendCode,
    rememberCode,
    validatePassword,
    resetPassword,
    isResetInvalid,
  }
}
