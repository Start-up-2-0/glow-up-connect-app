import type { EnderecoResumo } from '@/types/estabelecimento.types'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const TELEFONE_BR_DDI = '55'
export const TELEFONE_LOCAL_MAX_LENGTH = 11

export function normalizeTelefone(telefone: string | null | undefined): string {
  if (!telefone) return ''
  return telefone.replace(/\D/g, '')
}

/** Remove o DDI 55 para exibição no campo de edição. */
export function telefoneLocalFromApi(telefone: string | null | undefined): string {
  const digits = normalizeTelefone(telefone)
  if (!digits) return ''
  if (digits.startsWith(TELEFONE_BR_DDI)) return digits.slice(TELEFONE_BR_DDI.length)
  return digits
}

/** Monta o telefone completo para a API (sempre com prefixo 55). */
export function telefoneToApi(local: string | null | undefined): string {
  const digits = normalizeTelefone(local)
  if (!digits) return ''
  if (digits.startsWith(TELEFONE_BR_DDI)) return digits
  return `${TELEFONE_BR_DDI}${digits}`
}

/** Normaliza entrada do usuário, removendo DDI se colado junto. */
export function telefoneLocalFromInput(value: string): string {
  let digits = normalizeTelefone(value)
  if (digits.startsWith(TELEFONE_BR_DDI) && digits.length > TELEFONE_BR_DDI.length) {
    digits = digits.slice(TELEFONE_BR_DDI.length)
  }
  return digits.slice(0, TELEFONE_LOCAL_MAX_LENGTH)
}

/** Máscara visual para DDD + número (sem DDI). */
export function maskTelefoneLocal(digits: string): string {
  const d = digits.slice(0, TELEFONE_LOCAL_MAX_LENGTH)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`

  const ddd = d.slice(0, 2)
  const rest = d.slice(2)
  const isMobile = rest[0] === '9'

  if (isMobile) {
    if (rest.length <= 5) return `(${ddd}) ${rest}`
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
  }

  if (rest.length <= 4) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
}

export function formatTelefone(telefone: string | null | undefined): string {
  if (!telefone) return '—'
  const digits = normalizeTelefone(telefone)
  if (digits.length === 13 && digits.startsWith('55')) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return telefone
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDistanciaKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

export function formatEnderecoResumo(endereco: EnderecoResumo | null | undefined): string {
  if (!endereco) return 'Endereço não informado'
  const partes = [endereco.logradouro, endereco.bairro, `${endereco.cidade}/${endereco.estado}`]
  return partes.filter(Boolean).join(', ')
}

export function formatPrecoRange(min: number, max: number): string {
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function toTimeOnlyString(date: Date): string {
  return date.toTimeString().slice(0, 8)
}

export function agendamentoStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PendentePagamento: 'Pagamento pendente',
    Confirmado: 'Confirmado',
    EmAtendimento: 'Em atendimento',
    Concluido: 'Concluído',
    Cancelado: 'Cancelado',
    Expirado: 'Expirado',
    Reembolsado: 'Reembolsado',
    PendenteConfirmacao: 'Aguardando confirmação',
    Remarcado: 'Remarcado',
    NaoCompareceu: 'Não compareceu',
  }
  return labels[status] ?? status
}
