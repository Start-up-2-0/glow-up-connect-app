import { LANDING_PLANOS_URL, LANDING_URL } from '@/constants/routes'

export function redirectToLandingPlanos(): false {
  window.location.assign(LANDING_PLANOS_URL)
  return false
}

export function legalUrl(path: 'termos-de-uso' | 'politica-de-cookies'): string {
  return `${LANDING_URL}/${path}`
}

/** Extrai o token UUID de um link `/convite/{token}` ou devolve o próprio valor se já for o token. */
export function extractConviteToken(linkOuToken: string): string {
  const trimmed = linkOuToken.trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.findIndex((p) => p.toLowerCase() === 'convite')
    if (idx >= 0 && parts[idx + 1]) {
      return decodeURIComponent(parts[idx + 1]!)
    }
  } catch {
    /* não é URL absoluta — tenta último segmento */
  }

  const seg = trimmed.split('/').filter(Boolean).pop()
  return seg ? decodeURIComponent(seg) : trimmed
}

/** Monta o link público do convite com a base de `VITE_LANDING_URL`. */
export function convitePublicoUrl(linkOuToken: string): string {
  const token = extractConviteToken(linkOuToken)
  return `${LANDING_URL}/convite/${encodeURIComponent(token)}`
}
