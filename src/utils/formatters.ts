import type { EnderecoResumo } from '@/types/estabelecimento.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import { maskCep } from '@/utils/cep'

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

/** Máscara unificada com DDI (+55) em um único campo. */
export function maskTelefoneUnified(digits: string): string {
  const local = maskTelefoneLocal(digits)
  if (!local) return ''
  return `+55 ${local}`
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

/** Garante interpretação UTC wall-clock quando a API omite o sufixo Z. */
export function normalizeAgendaIso(iso: string): string {
  if (!iso) return iso
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(iso)) return iso
  return `${iso}Z`
}

/** Fuso operacional da agenda (Brasil, UTC-3). */
export const AGENDA_UTC_OFFSET_MINUTES = -180

export function getAgendaWallClockParts(reference = new Date()): {
  year: number
  month: number
  day: number
} {
  const shifted = new Date(
    reference.getTime() + (reference.getTimezoneOffset() + AGENDA_UTC_OFFSET_MINUTES) * 60_000,
  )
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  }
}

/** Data civil atual no fuso da agenda (yyyy-MM-dd). */
export function toDateOnlyStringAgenda(reference = new Date()): string {
  const { year, month, day } = getAgendaWallClockParts(reference)
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function dateOnlyAgendaToStartIso(isoDate: string): string {
  return `${isoDate}T00:00:00.000Z`
}

export function dateOnlyAgendaToEndIso(isoDate: string): string {
  return `${isoDate}T23:59:59.999Z`
}

export function agendaDateRangeToIso(
  inicio: string,
  fim: string,
): { inicio: string; fim: string } {
  return {
    inicio: dateOnlyAgendaToStartIso(inicio),
    fim: dateOnlyAgendaToEndIso(fim),
  }
}

export function inicioSemanaAtualAgendaDateOnly(reference = new Date()): string {
  const hoje = toDateOnlyStringAgenda(reference)
  const [year, month, day] = hoje.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const dow = date.getUTCDay()
  const offset = dow === 0 ? -6 : 1 - dow
  date.setUTCDate(date.getUTCDate() + offset)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function inicioMesAtualAgendaDateOnly(reference = new Date()): string {
  const { year, month } = getAgendaWallClockParts(reference)
  return `${year}-${String(month + 1).padStart(2, '0')}-01`
}

export function fimMesAtualAgendaDateOnly(reference = new Date()): string {
  const { year, month } = getAgendaWallClockParts(reference)
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

export function fimSemanaAtualAgendaDateOnly(reference = new Date()): string {
  return addDaysToDateOnlyAgenda(inicioSemanaAtualAgendaDateOnly(reference), 6)
}

export function addDaysToDateOnlyAgenda(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

/**
 * Horário de agenda: a API persiste o relógio local do estabelecimento com Kind UTC.
 * Evita deslocamento de fuso ao exibir no navegador.
 */
export function formatAgendaTime(iso: string): string {
  const d = new Date(normalizeAgendaIso(iso))
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/** Data ISO (yyyy-MM-dd) a partir de timestamp de agenda em UTC wall-clock. */
export function toDateOnlyFromIsoUtc(iso: string): string {
  const d = new Date(normalizeAgendaIso(iso))
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatAgendaDateTime(iso: string): string {
  const datePart = toDateOnlyFromIsoUtc(iso)
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const label = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
  return `${label} às ${formatAgendaTime(iso)}`
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export const formatBRL = formatCurrency

export function aplicarDescontoPercentual(preco: number, percentual: number): number {
  if (percentual <= 0) return preco
  if (percentual >= 100) return 0
  return Math.round(preco * (1 - percentual / 100) * 100) / 100
}

/** Limite de centavos no input monetário (R$ 9.999.999,99). */
export const CURRENCY_CENTS_MAX = 999_999_999

/** Extrai dígitos da entrada e interpreta como centavos (máscara left-shift). */
export function currencyCentsFromInput(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return 0
  const cents = Number.parseInt(digits, 10)
  if (!Number.isFinite(cents)) return 0
  return Math.min(cents, CURRENCY_CENTS_MAX)
}

/** Exibe valor monetário para o campo de edição (sem símbolo R$ — prefixo no componente). */
export function maskCurrencyBRL(cents: number): string {
  const safeCents = Math.max(0, Math.min(cents, CURRENCY_CENTS_MAX))
  const reais = safeCents / 100
  return reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Converte centavos inteiros para decimal da API. */
export function currencyCentsToDecimal(cents: number): number {
  return Math.round(cents) / 100
}

/** Converte decimal da API para centavos inteiros. */
export function decimalToCurrencyCents(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.min(Math.round(value * 100), CURRENCY_CENTS_MAX)
}

/** Valida preço monetário antes de enviar à API. */
export function isValidCurrencyValue(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= currencyCentsToDecimal(CURRENCY_CENTS_MAX)
}

export function formatLimite(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return 'Ilimitado'
  return String(valor)
}

export function formatDistanciaKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

/** Preço no formato Figma marketplace (ex.: 25,00). */
export function formatPrecoFigma(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Horário HH:mm para exibição no detalhe da loja. */
export function formatHorarioFigma(value: string): string {
  const trimmed = value.trim()
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5)
  return trimmed
}

export function formatEnderecoResumo(endereco: EnderecoResumo | null | undefined): string {
  if (!endereco) return 'Endereço não informado'
  const partes = [endereco.logradouro, endereco.bairro, `${endereco.cidade}/${endereco.estado}`]
  return partes.filter(Boolean).join(', ')
}

/** Endereço curto para cards de marketplace (Figma: logradouro, bairro). */
export function formatEnderecoCard(endereco: EnderecoResumo | null | undefined): string {
  if (!endereco) return 'Endereço não informado'
  return [endereco.logradouro, endereco.bairro].filter(Boolean).join(', ')
}

export function formatEnderecoOnboarding(est: Pick<
  OnboardingEstabelecimentoDraft,
  'cep' | 'logradouro' | 'numero' | 'bairro' | 'cidade' | 'estado' | 'complemento'
>): string {
  const partes = [
    est.logradouro,
    est.numero ? `nº ${est.numero}` : '',
    est.bairro ? `- ${est.bairro}` : '',
    est.cidade && est.estado ? `, ${est.cidade}/${est.estado}` : est.cidade || est.estado,
    est.cep ? ` — CEP ${maskCep(est.cep.replace(/\D/g, ''))}` : '',
    est.complemento ? ` (${est.complemento})` : '',
  ]
  return partes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

export function formatPrecoRange(min: number, max: number): string {
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

/** Rótulo curto para datas ISO (yyyy-MM-dd) sem ambiguidade de fuso. */
export function formatDateOnlyLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
}

/** Rótulo longo para revisão (ex.: segunda-feira, 08 de junho de 2026). */
export function formatDateOnlyLong(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Data curta numérica (ex.: 10/06/2026) para cabeçalhos de agenda. */
export function formatDateShortNumeric(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

/** Data em card de agenda (ex.: 10 de junho de 2026). */
export function formatAgendaDetailSubtitle(iso: string): string {
  const datePart = toDateOnlyFromIsoUtc(iso)
  return `${formatDateOnlyMedium(datePart)}, às ${formatAgendaTime(iso)}`
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatHistoricoMeta(iso: string, executor?: string | null): string {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
  return executor ? `${date} ${time} - por ${executor}` : `${date} ${time}`
}

export function formatAgendaCardDate(iso: string): string {
  const isoDate = iso.includes('T') ? toDateOnlyFromIsoUtc(iso) : iso
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/** Rótulo médio para horário (ex.: segunda-feira, 08 de junho). */
export function formatDateOnlyMedium(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDaysToDateOnly(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toDateOnlyString(date)
}

function parseIsoToDateOnlyParts(iso: string): string {
  return iso.includes('T') ? toDateOnlyFromIsoUtc(iso) : iso.slice(0, 10)
}

function dateOnlyToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function calendarDaysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

/** Dias restantes do trial (30 no 1º dia), alinhado ao DiasTrial da API. */
export function calcularDiasRestantesTrial(options: {
  diasTrial: number
  proximaDataVencimento: string
  inicio?: string | null
}): number {
  const hoje = startOfTodayLocal()

  if (options.inicio) {
    const inicio = dateOnlyToLocalDate(parseIsoToDateOnlyParts(options.inicio))
    const diasDecorridos = calendarDaysBetween(inicio, hoje)
    return Math.max(0, options.diasTrial - diasDecorridos)
  }

  const fimTrialDateOnly = addDaysToDateOnly(
    parseIsoToDateOnlyParts(options.proximaDataVencimento),
    -1,
  )
  const fimTrial = dateOnlyToLocalDate(fimTrialDateOnly)
  return Math.max(0, calendarDaysBetween(hoje, fimTrial))
}

export function toTimeOnlyString(date: Date): string {
  return date.toTimeString().slice(0, 8)
}

/** Horário HH:mm:ss para API a partir de timestamp de agenda em UTC wall-clock. */
export function toAgendaTimeOnlyString(iso: string): string {
  const d = new Date(normalizeAgendaIso(iso))
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  const seconds = String(d.getUTCSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
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
