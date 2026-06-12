import type { AgendaCustomDateRange } from '@/types/negocio/agenda.types'
import { EMPTY_AGENDA_CUSTOM_DATE_RANGE } from '@/types/negocio/agenda.types'

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

export function normalizeAgendaCustomDateRange(range: AgendaCustomDateRange): AgendaCustomDateRange {
  if (!range.inicio || !range.fim) return { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
  if (range.inicio <= range.fim) return { inicio: range.inicio, fim: range.fim }
  return { inicio: range.fim, fim: range.inicio }
}

export function customDateRangeToIso(range: AgendaCustomDateRange): { inicio: string; fim: string } | null {
  if (!hasAgendaCustomDateRange(range)) return null
  const normalized = normalizeAgendaCustomDateRange(range)
  const inicio = new Date(`${normalized.inicio}T00:00:00`)
  const fim = new Date(`${normalized.fim}T23:59:59`)
  return { inicio: inicio.toISOString(), fim: fim.toISOString() }
}
