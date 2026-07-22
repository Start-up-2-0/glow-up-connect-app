import type { AgendamentoStatus } from '@/types/agendamento.types'

export interface AgendamentoStatusTheme {
  borderClass: string
  badgeClass: string
}

const STATUS_THEME: Record<string, AgendamentoStatusTheme> = {
  Confirmado: {
    borderClass: 'agendamento-card--confirmado',
    badgeClass: 'agendamento-badge--confirmado',
  },
  PendenteConfirmacao: {
    borderClass: 'agendamento-card--pendente',
    badgeClass: 'agendamento-badge--pendente',
  },
  EmAtendimento: {
    borderClass: 'agendamento-card--em-atendimento',
    badgeClass: 'agendamento-badge--em-atendimento',
  },
  Concluido: {
    borderClass: 'agendamento-card--concluido',
    badgeClass: 'agendamento-badge--concluido',
  },
  Remarcado: {
    borderClass: 'agendamento-card--remarcado',
    badgeClass: 'agendamento-badge--remarcado',
  },
  Cancelado: {
    borderClass: 'agendamento-card--cancelado',
    badgeClass: 'agendamento-badge--cancelado',
  },
}

const DEFAULT_THEME: AgendamentoStatusTheme = {
  borderClass: 'agendamento-card--default',
  badgeClass: 'agendamento-badge--default',
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
