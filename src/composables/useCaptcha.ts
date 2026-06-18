const RECAPTCHA_SCRIPT_ID = 'glow-recaptcha-v2'
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js'

type GrecaptchaV2 = {
  ready: (callback: () => void) => void
  render: (
    container: HTMLElement,
    parameters: {
      sitekey: string
      callback?: () => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => number
  getResponse: (optWidgetId?: number) => string
  reset: (optWidgetId?: number) => void
}

function getGrecaptcha(): GrecaptchaV2 | undefined {
  return (window as Window & { grecaptcha?: GrecaptchaV2 }).grecaptcha
}

function getSiteKey(): string {
  return import.meta.env.VITE_CAPTCHA_SITE_KEY?.trim() ?? ''
}

let scriptLoadPromise: Promise<void> | null = null

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (getGrecaptcha()) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  const existing = document.getElementById(RECAPTCHA_SCRIPT_ID)
  if (existing) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar reCAPTCHA.')), {
        once: true,
      })
    })
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `${RECAPTCHA_SCRIPT_SRC}?render=explicit`
    script.async = true
    script.defer = true
    script.onload = () => {
      const grecaptcha = getGrecaptcha()
      if (!grecaptcha) {
        reject(new Error('reCAPTCHA indisponível.'))
        return
      }
      grecaptcha.ready(() => resolve())
    }
    script.onerror = () => reject(new Error('Falha ao carregar reCAPTCHA.'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function useCaptcha() {
  const siteKey = getSiteKey()
  const enabled = siteKey.length > 0
  let widgetId: number | null = null

  async function mountWidget(container: HTMLElement): Promise<void> {
    if (!enabled) {
      return
    }

    await loadRecaptchaScript()

    const grecaptcha = getGrecaptcha()
    if (!grecaptcha) {
      throw new Error('reCAPTCHA indisponível.')
    }

    if (widgetId !== null) {
      grecaptcha.reset(widgetId)
      return
    }

    widgetId = grecaptcha.render(container, { sitekey: siteKey })
  }

  function getToken(): string | undefined {
    if (!enabled) {
      return undefined
    }

    const grecaptcha = getGrecaptcha()
    if (!grecaptcha || widgetId === null) {
      return undefined
    }

    const response = grecaptcha.getResponse(widgetId).trim()
    return response.length > 0 ? response : undefined
  }

  function reset(): void {
    if (!enabled) {
      return
    }

    const grecaptcha = getGrecaptcha()
    if (!grecaptcha || widgetId === null) {
      return
    }

    grecaptcha.reset(widgetId)
  }

  /** @deprecated Use mountWidget + getToken (reCAPTCHA v2 checkbox). */
  async function execute(_action: 'login' | 'register'): Promise<string | undefined> {
    const token = getToken()
    if (enabled && !token) {
      throw new Error('Marque o reCAPTCHA antes de continuar.')
    }
    return token
  }

  return { enabled, mountWidget, getToken, reset, execute }
}
