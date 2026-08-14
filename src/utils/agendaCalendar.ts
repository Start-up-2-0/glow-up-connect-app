import type {
  AgendaCalendarEvent,
  AgendaCalendarResource,
  AgendaCalendarView,
  AgendaGeral,
  AgendaProfissional,
} from '@/types/negocio/agenda.types'
import {
  addDaysToDateOnlyAgenda,
  agendaDateRangeToIso,
  formatAgendaTime,
  getAgendaWallClockParts,
  normalizeAgendaIso,
  toDateOnlyFromIsoUtc,
  toDateOnlyStringAgenda,
} from '@/utils/formatters'

export const AGENDA_CALENDAR_WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const
export const AGENDA_CALENDAR_HOUR_HEIGHT = 72
export const AGENDA_CALENDAR_DEFAULT_START_HOUR = 8
export const AGENDA_CALENDAR_DEFAULT_END_HOUR = 20
export const AGENDA_CALENDAR_MIN_EVENT_MINUTES = 20
export const AGENDA_CALENDAR_MONTH_VISIBLE_EVENTS = 3

export const AGENDA_CALENDAR_VIEW_OPTIONS: ReadonlyArray<{ value: AgendaCalendarView; label: string }> = [
  { value: 'mes', label: 'Mês' },
  { value: 'semana', label: 'Semana' },
  { value: 'dia', label: 'Dia' },
]

export interface AgendaCalendarDayCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
}

export interface AgendaCalendarPositionedEvent {
  event: AgendaCalendarEvent
  startMin: number
  endMin: number
  column: number
  columnCount: number
}

export interface AgendaCalendarTimeRange {
  startHour: number
  endHour: number
}

function parseDateOnly(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number)
  return { year: year || 1970, month: month || 1, day: day || 1 }
}

function toDateOnlyUtc(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function localDateFromIso(iso: string): Date {
  const { year, month, day } = parseDateOnly(iso)
  return new Date(year, month - 1, day)
}

export function isAgendaCalendarView(value: unknown): value is AgendaCalendarView {
  return value === 'mes' || value === 'semana' || value === 'dia'
}

export function parseAgendaCalendarView(value: unknown): AgendaCalendarView | null {
  if (isAgendaCalendarView(value)) return value
  if (value === 'hoje') return 'dia'
  return null
}

export function isValidDateOnly(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function formatAgendaCalendarMonthTitle(iso: string): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(localDateFromIso(iso))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatAgendaCalendarDayTitle(iso: string): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(localDateFromIso(iso))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatAgendaCalendarRangeLabel(inicio: string, fim: string): string {
  const start = localDateFromIso(inicio)
  const end = localDateFromIso(fim)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const sameYear = start.getFullYear() === end.getFullYear()

  if (inicio === fim) {
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(start)
  }

  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(start)}`
  }

  const startFmt = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  }).format(start)
  const endFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(end)
  return `${startFmt} – ${endFmt}`
}

export function shiftAgendaMonth(iso: string, delta: number): string {
  const { year, month, day } = parseDateOnly(iso)
  const firstOfTarget = new Date(Date.UTC(year, month - 1 + delta, 1))
  const lastDay = new Date(
    Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0),
  ).getUTCDate()
  return toDateOnlyUtc(
    firstOfTarget.getUTCFullYear(),
    firstOfTarget.getUTCMonth() + 1,
    Math.min(day, lastDay),
  )
}

function weekStartMonday(iso: string): string {
  const { year, month, day } = parseDateOnly(iso)
  const date = new Date(Date.UTC(year, month - 1, day))
  const dow = date.getUTCDay()
  const offset = dow === 0 ? -6 : 1 - dow
  date.setUTCDate(date.getUTCDate() + offset)
  return toDateOnlyUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export function monthBounds(iso: string): { inicio: string; fim: string } {
  const { year, month } = parseDateOnly(iso)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return {
    inicio: toDateOnlyUtc(year, month, 1),
    fim: toDateOnlyUtc(year, month, lastDay),
  }
}

export function weekBounds(iso: string): { inicio: string; fim: string } {
  const inicio = weekStartMonday(iso)
  return {
    inicio,
    fim: addDaysToDateOnlyAgenda(inicio, 6),
  }
}

export function monthGridBounds(iso: string): { inicio: string; fim: string } {
  const { inicio, fim } = monthBounds(iso)
  return {
    inicio: weekStartMonday(inicio),
    fim: addDaysToDateOnlyAgenda(weekStartMonday(fim), 6),
  }
}

export function calendarDateRangeIso(view: AgendaCalendarView, cursorDate: string): { inicio: string; fim: string } {
  if (view === 'dia') return agendaDateRangeToIso(cursorDate, cursorDate)
  if (view === 'semana') {
    const bounds = weekBounds(cursorDate)
    return agendaDateRangeToIso(bounds.inicio, bounds.fim)
  }
  const bounds = monthGridBounds(cursorDate)
  return agendaDateRangeToIso(bounds.inicio, bounds.fim)
}

export function buildMonthGrid(cursorDate: string, today = toDateOnlyStringAgenda()): AgendaCalendarDayCell[] {
  const { inicio, fim } = monthGridBounds(cursorDate)
  const { month } = parseDateOnly(cursorDate)
  const cells: AgendaCalendarDayCell[] = []
  let iso = inicio
  while (iso <= fim) {
    const parts = parseDateOnly(iso)
    cells.push({
      iso,
      day: parts.day,
      inMonth: parts.month === month,
      isToday: iso === today,
    })
    iso = addDaysToDateOnlyAgenda(iso, 1)
  }
  return cells
}

export function agendaMinutesFromIso(iso: string): number {
  const d = new Date(normalizeAgendaIso(iso))
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

export function agendaNowMinutes(reference = new Date()): number {
  const { hours, minutes } = getAgendaWallClockParts(reference)
  return hours * 60 + minutes
}

export function groupEventsByDate(events: AgendaCalendarEvent[]): Map<string, AgendaCalendarEvent[]> {
  const grouped = new Map<string, AgendaCalendarEvent[]>()
  for (const event of events) {
    const key = toDateOnlyFromIsoUtc(event.inicio)
    const list = grouped.get(key)
    if (list) list.push(event)
    else grouped.set(key, [event])
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.inicio.localeCompare(b.inicio))
  }
  return grouped
}

export function resolveTimeRange(events: AgendaCalendarEvent[], includeNow = false): AgendaCalendarTimeRange {
  let start = AGENDA_CALENDAR_DEFAULT_START_HOUR * 60
  let end = AGENDA_CALENDAR_DEFAULT_END_HOUR * 60

  for (const event of events) {
    start = Math.min(start, agendaMinutesFromIso(event.inicio))
    end = Math.max(end, agendaMinutesFromIso(event.fim) || agendaMinutesFromIso(event.inicio) + AGENDA_CALENDAR_MIN_EVENT_MINUTES)
  }

  if (includeNow) {
    const now = agendaNowMinutes()
    start = Math.min(start, now)
    end = Math.max(end, now + 30)
  }

  const startHour = Math.max(0, Math.floor(start / 60))
  const endHour = Math.min(24, Math.max(startHour + 1, Math.ceil(end / 60)))
  return { startHour, endHour }
}

export function layoutOverlappingEvents(events: AgendaCalendarEvent[]): AgendaCalendarPositionedEvent[] {
  const items = events
    .map((event) => {
      const startMin = agendaMinutesFromIso(event.inicio)
      const rawEnd = agendaMinutesFromIso(event.fim)
      return {
        event,
        startMin,
        endMin: Math.max(rawEnd, startMin + AGENDA_CALENDAR_MIN_EVENT_MINUTES),
        column: 0,
        columnCount: 1,
      }
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  const columnEnds: number[] = []

  for (const item of items) {
    let column = columnEnds.findIndex((end) => end <= item.startMin)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(item.endMin)
    } else {
      columnEnds[column] = item.endMin
    }
    item.column = column
  }

  const columnCountByItem = new Map<number, number>()
  const parent = items.map((_, index) => index)

  function find(index: number): number {
    let current = index
    while (parent[current] !== current) {
      parent[current] = parent[parent[current]]
      current = parent[current]
    }
    return current
  }

  function union(left: number, right: number) {
    const rootLeft = find(left)
    const rootRight = find(right)
    if (rootLeft !== rootRight) parent[rootLeft] = rootRight
  }

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].startMin < items[j].endMin && items[j].startMin < items[i].endMin) {
        union(i, j)
      }
    }
  }

  const clusterWidth = new Map<number, number>()
  items.forEach((item, index) => {
    const root = find(index)
    clusterWidth.set(root, Math.max(clusterWidth.get(root) ?? 1, item.column + 1))
  })
  items.forEach((_, index) => {
    columnCountByItem.set(index, clusterWidth.get(find(index)) ?? 1)
  })

  return items.map((item, index) => ({
    ...item,
    columnCount: columnCountByItem.get(index) ?? 1,
  }))
}

export function formatEventTimeRange(event: AgendaCalendarEvent): string {
  return `${formatAgendaTime(event.inicio)} – ${formatAgendaTime(event.fim)}`
}

export function toCalendarEventsFromGeral(agendamentos: AgendaGeral[]): AgendaCalendarEvent[] {
  return agendamentos.flatMap((agendamento) => {
    const itens = agendamento.itens.length
      ? agendamento.itens
      : [
          {
            id: 0,
            servicoId: 0,
            servicoNome: '',
            profissionalId: 0,
            profissionalNome: '',
            inicio: agendamento.inicio,
            fim: agendamento.fim,
            valor: agendamento.valorTotal,
            status: agendamento.status,
          },
        ]

    return itens.map((item) => ({
      id: agendamento.id,
      agendamentoItemId: item.id || null,
      clienteNome: agendamento.clienteNome,
      servicoNome: item.servicoNome,
      profissionalId: item.profissionalId || null,
      profissionalNome: item.profissionalNome || '',
      status: agendamento.status,
      agendamentoStatus: agendamento.status,
      itemStatus: item.status,
      valorTotal: agendamento.valorTotal,
      inicio: item.inicio || agendamento.inicio,
      fim: item.fim || agendamento.fim,
    }))
  })
}

export function toCalendarEventsFromPropria(itens: AgendaProfissional[]): AgendaCalendarEvent[] {
  return itens.map((item) => ({
    id: item.agendamentoId,
    agendamentoItemId: item.agendamentoItemId,
    clienteNome: item.clienteNome,
    servicoNome: item.servicoNome,
    profissionalId: null,
    profissionalNome: '',
    status: item.agendamentoStatus || item.status,
    agendamentoStatus: item.agendamentoStatus || item.status,
    itemStatus: item.status,
    valorTotal: 0,
    inicio: item.inicio,
    fim: item.fim,
  }))
}

export function uniqueResourcesFromEvents(events: AgendaCalendarEvent[]): AgendaCalendarResource[] {
  const map = new Map<number, string>()
  for (const event of events) {
    if (!event.profissionalId) continue
    if (!map.has(event.profissionalId)) {
      map.set(event.profissionalId, event.profissionalNome || `Profissional ${event.profissionalId}`)
    }
  }
  return [...map.entries()]
    .map(([id, nome]) => ({ id, nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function eventsForResource(
  events: AgendaCalendarEvent[],
  resourceId: number | null,
): AgendaCalendarEvent[] {
  if (resourceId == null) return events
  return events.filter((event) => event.profissionalId === resourceId)
}
