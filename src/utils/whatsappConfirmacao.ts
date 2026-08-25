import { normalizeTelefone } from '@/utils/formatters'

export function buildLinkWhatsApp(numeroPlataforma: string, token: string): string {
  const numero = normalizeTelefone(numeroPlataforma)
  if (!numero || !token) return ''
  return `https://wa.me/${numero}?text=${encodeURIComponent(token)}`
}

export function buildLinkConfirmacao(token: string, baseUrl?: string): string {
  if (!token) return ''
  const origin =
    baseUrl?.replace(/\/$/, '') ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  if (!origin) return `/c/${token}`
  return `${origin}/c/${token}`
}

export function resolveNumeroPlataforma(
  numeroApi?: string,
  numeroEnv?: string,
): string | undefined {
  const candidato = numeroApi?.trim() || numeroEnv?.trim()
  return candidato || undefined
}
