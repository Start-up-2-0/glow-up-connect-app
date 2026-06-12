import { computed, ref } from 'vue'
import type { AgendamentoFiltro } from '@/types/agendamento.types'
import {
  EMPTY_AGENDA_CUSTOM_DATE_RANGE,
  type AgendaCustomDateRange,
  type AgendaFiltro,
  type AgendaOrdenacao,
} from '@/types/negocio/agenda.types'
import {
  customDateRangeToIso,
  hasAgendaCustomDateRange,
  validateAgendaCustomDateRange,
} from '@/utils/agendaDateRange'
import {
  AGENDA_DEFAULT_ORDENACAO,
  AGENDA_PAGE_SIZE,
  AGENDA_SORT_FILTER_OPTIONS,
} from '@/constants/agendaFilters'
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

export function useAgendaPageFilters(defaultPeriod: AgendaPeriodFilter = 'mes') {
  const statusFilter = ref('')
  const periodFilter = ref<string>(defaultPeriod)
  const customDateRange = ref<AgendaCustomDateRange>({ ...EMPTY_AGENDA_CUSTOM_DATE_RANGE })
  const sortFilter = ref<AgendaOrdenacao>(AGENDA_DEFAULT_ORDENACAO)
  const pagina = ref(1)
  const total = ref(0)
  const tamanhoPagina = AGENDA_PAGE_SIZE

  const statusOptions = AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const periodOptions = AGENDA_PERIOD_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const sortOptions = AGENDA_SORT_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const dateRange = computed(() => {
    const customRange = customDateRangeToIso(customDateRange.value)
    if (customRange) {
      return {
        inicio: customRange.inicio,
        fim: customRange.fim,
        label: `${customDateRange.value.inicio}_${customDateRange.value.fim}`,
      }
    }

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

    if (periodFilter.value === 'mes' || !periodFilter.value) {
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

  const apiFiltro = computed<AgendaFiltro>(() => ({
    inicio: dateRange.value.inicio,
    fim: dateRange.value.fim,
    pagina: pagina.value,
    tamanhoPagina,
    ordenacao: sortFilter.value,
    ...(statusFilter.value ? { status: statusFilter.value } : {}),
  }))

  const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / tamanhoPagina)))

  function resetPagina() {
    pagina.value = 1
  }

  function applyPeriodFilter(value: string) {
    periodFilter.value = value || defaultPeriod
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    resetPagina()
  }

  function applyCustomDateRange(value: AgendaCustomDateRange) {
    if (hasAgendaCustomDateRange(value) && !validateAgendaCustomDateRange(value).valid) return
    customDateRange.value = value
    if (hasAgendaCustomDateRange(value)) {
      periodFilter.value = ''
    } else if (!periodFilter.value) {
      periodFilter.value = defaultPeriod
    }
    resetPagina()
  }

  function clearPeriodFilter() {
    periodFilter.value = defaultPeriod
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    resetPagina()
  }

  function clearCustomDateRange() {
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    if (!periodFilter.value) {
      periodFilter.value = defaultPeriod
    }
    resetPagina()
  }

  function applySortFilter(value: string) {
    sortFilter.value = (value || AGENDA_DEFAULT_ORDENACAO) as AgendaOrdenacao
    resetPagina()
  }

  function clearSortFilter() {
    sortFilter.value = AGENDA_DEFAULT_ORDENACAO
    resetPagina()
  }

  return {
    statusFilter,
    periodFilter,
    customDateRange,
    sortFilter,
    pagina,
    total,
    totalPaginas,
    tamanhoPagina,
    statusOptions,
    periodOptions,
    sortOptions,
    dateRange,
    apiFiltro,
    resetPagina,
    applyPeriodFilter,
    applyCustomDateRange,
    clearPeriodFilter,
    clearCustomDateRange,
    applySortFilter,
    clearSortFilter,
  }
}

export function useMeusAgendamentosFilters() {
  const statusFilter = ref('')
  const periodFilter = ref<string>('mes')
  const customDateRange = ref<AgendaCustomDateRange>({ ...EMPTY_AGENDA_CUSTOM_DATE_RANGE })
  const sortFilter = ref<AgendaOrdenacao>(AGENDA_DEFAULT_ORDENACAO)
  const pagina = ref(1)
  const defaultPeriod = 'mes'

  const statusOptions = AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const periodOptions = MEUS_AGENDAMENTOS_PERIOD_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const sortOptions = AGENDA_SORT_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const apiFiltro = computed<AgendamentoFiltro>(() => {
    const filtro: AgendamentoFiltro = {
      pagina: pagina.value,
      tamanhoPagina: AGENDA_PAGE_SIZE,
      ordenacao: sortFilter.value,
    }

    if (statusFilter.value) {
      filtro.status = statusFilter.value
    }

    if (hasAgendaCustomDateRange(customDateRange.value)) {
      filtro.dataInicio = customDateRange.value.inicio
      filtro.dataFim = customDateRange.value.fim
      return filtro
    }

    if (periodFilter.value === 'proximos' || periodFilter.value === 'recentes') {
      filtro.ordenacao = periodFilter.value === 'recentes' ? 'criacao_desc' : 'atendimento_asc'
      return filtro
    }

    const hoje = toDateOnlyString(new Date())
    if (periodFilter.value === 'semana') {
      filtro.dataInicio = hoje
      filtro.dataFim = addDaysToDateOnly(hoje, 6)
      return filtro
    }

    if (periodFilter.value === 'mes' || !periodFilter.value) {
      const now = new Date()
      filtro.dataInicio = toDateOnlyString(new Date(now.getFullYear(), now.getMonth(), 1))
      filtro.dataFim = toDateOnlyString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    }

    return filtro
  })

  function resetPagina() {
    pagina.value = 1
  }

  function applyPeriodFilter(value: string) {
    periodFilter.value = value || defaultPeriod
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    resetPagina()
  }

  function applyCustomDateRange(value: AgendaCustomDateRange) {
    if (hasAgendaCustomDateRange(value) && !validateAgendaCustomDateRange(value).valid) return
    customDateRange.value = value
    if (hasAgendaCustomDateRange(value)) {
      periodFilter.value = ''
    } else if (!periodFilter.value) {
      periodFilter.value = defaultPeriod
    }
    resetPagina()
  }

  function clearPeriodFilter() {
    periodFilter.value = defaultPeriod
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    resetPagina()
  }

  function clearCustomDateRange() {
    customDateRange.value = { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE }
    if (!periodFilter.value) {
      periodFilter.value = defaultPeriod
    }
    resetPagina()
  }

  function applySortFilter(value: string) {
    sortFilter.value = (value || AGENDA_DEFAULT_ORDENACAO) as AgendaOrdenacao
    resetPagina()
  }

  function clearSortFilter() {
    sortFilter.value = AGENDA_DEFAULT_ORDENACAO
    resetPagina()
  }

  return {
    statusFilter,
    periodFilter,
    customDateRange,
    sortFilter,
    pagina,
    statusOptions,
    periodOptions,
    sortOptions,
    apiFiltro,
    resetPagina,
    applyPeriodFilter,
    applyCustomDateRange,
    clearPeriodFilter,
    clearCustomDateRange,
    applySortFilter,
    clearSortFilter,
  }
}
