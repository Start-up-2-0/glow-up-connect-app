import type { AgendaOrdenacao } from '@/types/negocio/agenda.types'

export const AGENDA_SORT_FILTER_OPTIONS: ReadonlyArray<{ value: AgendaOrdenacao; label: string }> = [
  { value: 'atendimento_desc', label: 'Data do atendimento decrescente' },
  { value: 'atendimento_asc', label: 'Data do atendimento crescente' },
  { value: 'criacao_desc', label: 'Mais recentes primeiro' },
  { value: 'criacao_asc', label: 'Mais antigos primeiro' },
]

export const AGENDA_DEFAULT_ORDENACAO: AgendaOrdenacao = 'atendimento_desc'
export const AGENDA_PAGE_SIZE = 12
export const AGENDA_CALENDAR_PAGE_SIZE = 50
export const AGENDA_CALENDAR_MAX_PAGES = 20
