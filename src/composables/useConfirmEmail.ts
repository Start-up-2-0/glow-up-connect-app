import { isAxiosError } from 'axios'
import { authService } from '@/services/authService'
import { useApiError } from '@/composables/useApiError'
import { isApiErrorResponse } from '@/types/api.types'

export { maskEmail } from '@/utils/passwordRules'

const STORAGE_EMAIL_KEY = 'guc_confirm_email'
const RESEND_COOLDOWN_SECONDS = 60
const CODE_LENGTH = 6

const DEFAULT_RESEND_MESSAGE =
  'Se o e-mail estiver cadastrado e pendente de confirmação, enviaremos um novo link e código.'

export function useConfirmEmail() {
  const { resolveErrorCode } = useApiError()

  function setStoredEmail(email: string) {
    sessionStorage.setItem(STORAGE_EMAIL_KEY, email.trim())
  }

  function getStoredEmail(): string | null {
    return sessionStorage.getItem(STORAGE_EMAIL_KEY)
  }

  function clearConfirmSession() {
    sessionStorage.removeItem(STORAGE_EMAIL_KEY)
  }

  function normalizeCode(codigo: string): string {
    return codigo.replace(/\D/g, '').slice(0, CODE_LENGTH)
  }

  async function confirmByCode(
    codigo: string,
  ): Promise<{ ok: true } | { ok: false; invalid: boolean }> {
    const normalized = normalizeCode(codigo)
    if (normalized.length !== CODE_LENGTH) {
      return { ok: false, invalid: true }
    }

    try {
      await authService.confirmarEmail({ codigo: normalized })
      return { ok: true }
    } catch (err) {
      if (resolveErrorCode(err) === 'CONFIRMACAO_EMAIL_INVALIDA') {
        return { ok: false, invalid: true }
      }
      throw err
    }
  }

  async function confirmByToken(
    token: string,
  ): Promise<{ ok: true } | { ok: false; invalid: boolean }> {
    const trimmed = token.trim()
    if (!trimmed) {
      return { ok: false, invalid: true }
    }

    try {
      await authService.confirmarEmail({ token: trimmed })
      return { ok: true }
    } catch (err) {
      if (resolveErrorCode(err) === 'CONFIRMACAO_EMAIL_INVALIDA') {
        return { ok: false, invalid: true }
      }
      throw err
    }
  }

  async function resendConfirmation(
    emailOverride?: string,
  ): Promise<{ ok: true; message: string } | { ok: false; missingEmail?: boolean }> {
    const email = (emailOverride ?? getStoredEmail())?.trim()
    if (!email) return { ok: false, missingEmail: true }

    try {
      const { data } = await authService.reenviarConfirmacao({
        email: email.toLowerCase(),
      })
      const message =
        data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
          ? data.message
          : DEFAULT_RESEND_MESSAGE
      return { ok: true, message }
    } catch (err) {
      if (isAxiosError(err)) {
        const responseData = err.response?.data
        if (isApiErrorResponse(responseData)) {
          return { ok: false }
        }
      }
      throw err
    }
  }

  async function resendWhatsAppConfirmation(
    emailOverride?: string,
  ): Promise<{ ok: true; message: string } | { ok: false; missingEmail?: boolean }> {
    const email = (emailOverride ?? getStoredEmail())?.trim()
    if (!email) return { ok: false, missingEmail: true }

    try {
      const { data } = await authService.reenviarConfirmacaoWhatsApp({
        email: email.toLowerCase(),
      })
      const message =
        data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
          ? data.message
          : 'Se o e-mail estiver cadastrado, enviaremos novas instruções para confirmar o WhatsApp.'
      return { ok: true, message }
    } catch (err) {
      if (isAxiosError(err)) {
        const responseData = err.response?.data
        if (isApiErrorResponse(responseData)) {
          return { ok: false }
        }
      }
      throw err
    }
  }

  return {
    RESEND_COOLDOWN_SECONDS,
    setStoredEmail,
    getStoredEmail,
    clearConfirmSession,
    confirmByCode,
    confirmByToken,
    resendConfirmation,
    resendWhatsAppConfirmation,
  }
}
