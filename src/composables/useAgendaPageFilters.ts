import { computed, ref } from 'vue'
import type { AgendamentoStatus } from '@/types/agendamento.types'
import { AGENDA_STATUS_FILTER_OPTIONS } from '@/utils/agendamentoStatusTheme'
import { addDaysToDateOnly, toDateOnlyString } from '@/utils/formatters'

export const AGENDA_PERIOD_FILTER_OPTIONS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
] as const

export const MEUS_AGENDAMENTOS_PERIOD_OPTIONS = [
  { value: 'proximos', label: 'Próximos' },
  { value: 'recentes', label: 'Recentes' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
] as const

export type AgendaPeriodFilter = (typeof AGENDA_PERIOD_FILTER_OPTIONS)[number]['value']
export type MeusAgendamentosPeriodFilter = (typeof MEUS_AGENDAMENTOS_PERIOD_OPTIONS)[number]['value']

export function useAgendaPageFilters(defaultPeriod: AgendaPeriodFilter = 'hoje') {
  const statusFilter = ref('')
  const periodFilter = ref<string>(defaultPeriod)

  const statusOptions = AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const periodOptions = AGENDA_PERIOD_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const dateRange = computed(() => {
    const now = new Date()
    const hoje = toDateOnlyString(now)

    if (periodFilter.value === 'semana') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      const inicio = new Date(now)
      inicio.setDate(diff)
      inicio.setHours(0, 0, 0, 0)
      const fim = new Date(inicio)
      fim.setDate(fim.getDate() + 6)
      fim.setHours(23, 59, 59, 999)
      return { inicio: inicio.toISOString(), fim: fim.toISOString() }
    }

    if (periodFilter.value === 'mes') {
      const inicio = new Date(now.getFullYear(), now.getMonth(), 1)
      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { inicio: inicio.toISOString(), fim: fim.toISOString() }
    }

    const inicio = new Date(now)
    inicio.setHours(0, 0, 0, 0)
    const fim = new Date(now)
    fim.setHours(23, 59, 59, 999)
    return { inicio: inicio.toISOString(), fim: fim.toISOString(), label: hoje }
  })

  function matchesStatus(status: string) {
    if (!statusFilter.value) return true
    return status === statusFilter.value
  }

  return {
    statusFilter,
    periodFilter,
    statusOptions,
    periodOptions,
    dateRange,
    matchesStatus,
  }
}

export function useMeusAgendamentosFilters() {
  const statusFilter = ref('')
  const periodFilter = ref<MeusAgendamentosPeriodFilter>('proximos')

  const statusOptions = AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const periodOptions = MEUS_AGENDAMENTOS_PERIOD_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const apiFiltro = computed(() => {
    const filtro: {
      status?: AgendamentoStatus | string
      ordenacao?: 'proximos' | 'recentes'
      dataInicio?: string
      dataFim?: string
    } = {}

    if (statusFilter.value) {
      filtro.status = statusFilter.value
    }

    if (periodFilter.value === 'proximos' || periodFilter.value === 'recentes') {
      filtro.ordenacao = periodFilter.value
      return filtro
    }

    const hoje = toDateOnlyString(new Date())
    if (periodFilter.value === 'semana') {
      filtro.dataInicio = hoje
      filtro.dataFim = addDaysToDateOnly(hoje, 6)
      filtro.ordenacao = 'proximos'
      return filtro
    }

    if (periodFilter.value === 'mes') {
      const now = new Date()
      filtro.dataInicio = toDateOnlyString(new Date(now.getFullYear(), now.getMonth(), 1))
      filtro.dataFim = toDateOnlyString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
      filtro.ordenacao = 'proximos'
    }

    return filtro
  })

  return {
    statusFilter,
    periodFilter,
    statusOptions,
    periodOptions,
    apiFiltro,
  }
}
