import { LANDING_PLANOS_URL } from '@/constants/routes'

export function redirectToLandingPlanos(): false {
  window.location.assign(LANDING_PLANOS_URL)
  return false
}

export function legalUrl(path: 'termos-de-uso' | 'politica-de-cookies'): string {
  const base = import.meta.env.VITE_LANDING_URL?.trim() || 'https://glowupconnect.com.br'
  return `${base.replace(/\/+$/, '')}/${path}`
}
