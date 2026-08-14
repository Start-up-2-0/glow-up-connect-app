import type { AgendamentoStatus } from '@/types/agendamento.types'

export interface AgendamentoStatusTheme {
  borderClass: string
  badgeClass: string
  pillClass: string
}

const STATUS_THEME: Record<string, AgendamentoStatusTheme> = {
  Confirmado: {
    borderClass: 'agendamento-card--confirmado',
    badgeClass: 'agendamento-badge--confirmado',
    pillClass: 'agenda-cal-event--confirmado',
  },
  Agendado: {
    borderClass: 'agendamento-card--confirmado',
    badgeClass: 'agendamento-badge--confirmado',
    pillClass: 'agenda-cal-event--confirmado',
  },
  PendenteConfirmacao: {
    borderClass: 'agendamento-card--pendente',
    badgeClass: 'agendamento-badge--pendente',
    pillClass: 'agenda-cal-event--pendente',
  },
  EmAtendimento: {
    borderClass: 'agendamento-card--em-atendimento',
    badgeClass: 'agendamento-badge--em-atendimento',
    pillClass: 'agenda-cal-event--em-atendimento',
  },
  Concluido: {
    borderClass: 'agendamento-card--concluido',
    badgeClass: 'agendamento-badge--concluido',
    pillClass: 'agenda-cal-event--concluido',
  },
  Realizado: {
    borderClass: 'agendamento-card--concluido',
    badgeClass: 'agendamento-badge--concluido',
    pillClass: 'agenda-cal-event--concluido',
  },
  Remarcado: {
    borderClass: 'agendamento-card--remarcado',
    badgeClass: 'agendamento-badge--remarcado',
    pillClass: 'agenda-cal-event--remarcado',
  },
  Cancelado: {
    borderClass: 'agendamento-card--cancelado',
    badgeClass: 'agendamento-badge--cancelado',
    pillClass: 'agenda-cal-event--cancelado',
  },
}

const DEFAULT_THEME: AgendamentoStatusTheme = {
  borderClass: 'agendamento-card--default',
  badgeClass: 'agendamento-badge--default',
  pillClass: 'agenda-cal-event--default',
}

export function resolveAgendamentoStatusTheme(status: AgendamentoStatus | string): AgendamentoStatusTheme {
  return STATUS_THEME[status] ?? DEFAULT_THEME
}

export const AGENDA_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PendenteConfirmacao', label: 'Aguardando confirmação' },
  { value: 'Confirmado', label: 'Confirmado' },
  { value: 'EmAtendimento', label: 'Em atendimento' },
  { value: 'Concluido', label: 'Concluído' },
  { value: 'Remarcado', label: 'Remarcado' },
  { value: 'Cancelado', label: 'Cancelado' },
] as const
