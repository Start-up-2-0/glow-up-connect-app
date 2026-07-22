import { normalizeTelefone } from '@/utils/formatters'

const TELEFONE_BR_DDI = '55'
const TELEFONE_BRASIL_CONFIRMACAO_DIGITOS = 13

export function normalizarTelefoneConfirmacaoInbound(telefone: string): string {
  let digitos = normalizeTelefone(telefone)
  if (!digitos) return ''

  if (!digitos.startsWith(TELEFONE_BR_DDI) && (digitos.length === 10 || digitos.length === 11)) {
    digitos = `${TELEFONE_BR_DDI}${digitos}`
  }

  if (digitos.length !== TELEFONE_BRASIL_CONFIRMACAO_DIGITOS && digitos.length >= 4) {
    digitos = `${digitos.slice(0, 4)}9${digitos.slice(4)}`
  }

  return digitos
}

export function telefoneToConfirmacaoToken(telefone: string): string {
  const normalizado = normalizarTelefoneConfirmacaoInbound(telefone)
  if (!normalizado) return ''
  return btoa(normalizado)
}

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
