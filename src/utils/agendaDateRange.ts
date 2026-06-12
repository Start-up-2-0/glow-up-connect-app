import type { AgendaCustomDateRange } from '@/types/negocio/agenda.types'
import { EMPTY_AGENDA_CUSTOM_DATE_RANGE } from '@/types/negocio/agenda.types'
import { addDaysToDateOnly, toDateOnlyString } from '@/utils/formatters'

/** Máximo de dias entre data inicial e final (intervalo de até 1 ano). */
export const AGENDA_CUSTOM_DATE_RANGE_MAX_DAYS = 364

export interface AgendaDateRangeValidation {
  valid: boolean
  message: string | null
}

export function hasAgendaCustomDateRange(range: AgendaCustomDateRange): boolean {
  return Boolean(range.inicio && range.fim)
}

export function formatAgendaDateRangeLabel(range: AgendaCustomDateRange): string {
  if (!hasAgendaCustomDateRange(range)) return ''
  return `${formatDateBr(range.inicio)} - ${formatDateBr(range.fim)}`
}

export function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

export function getAgendaCustomDateRangeMaxDate(reference = new Date()): string {
  return toDateOnlyString(reference)
}

export function validateAgendaCustomDateRange(
  range: AgendaCustomDateRange,
  reference = new Date(),
): AgendaDateRangeValidation {
  if (!range.inicio || !range.fim) {
    return { valid: false, message: null }
  }

  const hoje = getAgendaCustomDateRangeMaxDate(reference)

  if (range.fim < range.inicio) {
    return { valid: false, message: 'A data final não pode ser anterior à data inicial.' }
  }

  if (range.fim > hoje) {
    return { valid: false, message: 'A data final não pode ultrapassar a data atual.' }
  }

  const limiteUmAno = addDaysToDateOnly(range.inicio, AGENDA_CUSTOM_DATE_RANGE_MAX_DAYS)
  if (range.fim > limiteUmAno) {
    return { valid: false, message: 'O intervalo não pode ultrapassar 1 ano.' }
  }

  return { valid: true, message: null }
}

export function normalizeAgendaCustomDateRange(range: AgendaCustomDateRange): AgendaCustomDateRange {
  const validation = validateAgendaCustomDateRange(range)
  if (!validation.valid) return { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
  return { inicio: range.inicio, fim: range.fim }
}

export function customDateRangeToIso(range: AgendaCustomDateRange): { inicio: string; fim: string } | null {
  if (!hasAgendaCustomDateRange(range)) return null
  const validation = validateAgendaCustomDateRange(range)
  if (!validation.valid) return null

  const inicio = new Date(`${range.inicio}T00:00:00`)
  const fim = new Date(`${range.fim}T23:59:59`)
  return { inicio: inicio.toISOString(), fim: fim.toISOString() }
}
