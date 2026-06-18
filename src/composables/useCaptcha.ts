const RECAPTCHA_SCRIPT_ID = 'glow-recaptcha-v3'
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js'

function getSiteKey(): string {
  return import.meta.env.VITE_CAPTCHA_SITE_KEY?.trim() ?? ''
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  const grecaptcha = (window as Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha
  if (grecaptcha) {
    return Promise.resolve()
  }

  const existing = document.getElementById(RECAPTCHA_SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar reCAPTCHA.')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `${RECAPTCHA_SCRIPT_SRC}?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar reCAPTCHA.'))
    document.head.appendChild(script)
  })
}

export function useCaptcha() {
  const siteKey = getSiteKey()
  const enabled = siteKey.length > 0

  async function execute(action: 'login' | 'register'): Promise<string | undefined> {
    if (!enabled) {
      return undefined
    }

    await loadRecaptchaScript(siteKey)

    const grecaptcha = (window as Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha
    if (!grecaptcha) {
      throw new Error('reCAPTCHA indisponível.')
    }

    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(siteKey, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  return { enabled, execute }
}
