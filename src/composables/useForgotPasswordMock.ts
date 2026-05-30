import { getUnmetPasswordRules } from '@/utils/passwordRules'

export { PASSWORD_RULES, getUnmetPasswordRules, maskEmail } from '@/utils/passwordRules'

const STORAGE_EMAIL_KEY = 'guc_recovery_email'
const STORAGE_RESEND_COUNT_KEY = 'guc_recovery_resend_count'
const STORAGE_CODE_ATTEMPTS_KEY = 'guc_recovery_code_attempts'

/** E-mail usado no mock para simular "não encontrado" */
export const MOCK_INVALID_EMAIL = 'invalido@test.com'

/** Código válido no mock — qualquer outro código de 6 dígitos é inválido */
export const MOCK_VALID_CODE = '123456'

const RESEND_COOLDOWN_SECONDS = 60
const MAX_RESENDS_BEFORE_LIMIT = 3
const MAX_CODE_ATTEMPTS = 3

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useForgotPasswordMock() {
  function getStoredEmail(): string | null {
    return sessionStorage.getItem(STORAGE_EMAIL_KEY)
  }

  function clearRecoverySession() {
    sessionStorage.removeItem(STORAGE_EMAIL_KEY)
    sessionStorage.removeItem(STORAGE_RESEND_COUNT_KEY)
    sessionStorage.removeItem(STORAGE_CODE_ATTEMPTS_KEY)
  }

  function getCodeAttempts(): number {
    return Number(sessionStorage.getItem(STORAGE_CODE_ATTEMPTS_KEY) ?? '0')
  }

  function resetCodeAttempts() {
    sessionStorage.removeItem(STORAGE_CODE_ATTEMPTS_KEY)
  }

  function resetRateLimit() {
    sessionStorage.setItem(STORAGE_RESEND_COUNT_KEY, '0')
    resetCodeAttempts()
  }

  function getResendCount(): number {
    return Number(sessionStorage.getItem(STORAGE_RESEND_COUNT_KEY) ?? '0')
  }

  async function sendCode(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
    await delay(500)

    const trimmed = email.trim()
    if (!trimmed.includes('@') || trimmed === MOCK_INVALID_EMAIL) {
      return {
        ok: false,
        error: 'E-mail não encontrado. Certifique-se de que seja um e-mail válido.',
      }
    }

    sessionStorage.setItem(STORAGE_EMAIL_KEY, trimmed)
    sessionStorage.setItem(STORAGE_RESEND_COUNT_KEY, '0')
    resetCodeAttempts()
    return { ok: true }
  }

  async function resendCode(): Promise<
    | { ok: true; rateLimited: false }
    | { ok: false; rateLimited: true }
  > {
    await delay(400)

    const count = getResendCount() + 1
    sessionStorage.setItem(STORAGE_RESEND_COUNT_KEY, String(count))

    if (count >= MAX_RESENDS_BEFORE_LIMIT) {
      return { ok: false, rateLimited: true }
    }

    return { ok: true, rateLimited: false }
  }

  function resetResendLimit() {
    resetRateLimit()
  }

  async function requestNewCode(): Promise<void> {
    await delay(400)
    resetRateLimit()
  }

  async function verifyCode(code: string): Promise<{
    valid: boolean
    rateLimited: boolean
    invalid: boolean
  }> {
    await delay(300)

    if (code === MOCK_VALID_CODE) {
      resetCodeAttempts()
      return { valid: true, rateLimited: false, invalid: false }
    }

    const attempts = getCodeAttempts() + 1
    sessionStorage.setItem(STORAGE_CODE_ATTEMPTS_KEY, String(attempts))

    if (attempts >= MAX_CODE_ATTEMPTS) {
      return { valid: false, rateLimited: true, invalid: true }
    }

    return { valid: false, rateLimited: false, invalid: true }
  }

  function validatePassword(senha: string, confirmarSenha: string): {
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

  async function resetPassword(_senha: string): Promise<boolean> {
    await delay(500)
    clearRecoverySession()
    return true
  }

  return {
    RESEND_COOLDOWN_SECONDS,
    getStoredEmail,
    clearRecoverySession,
    getResendCount,
    getCodeAttempts,
    sendCode,
    resendCode,
    resetResendLimit,
    resetRateLimit,
    resetCodeAttempts,
    requestNewCode,
    verifyCode,
    validatePassword,
    resetPassword,
  }
}
