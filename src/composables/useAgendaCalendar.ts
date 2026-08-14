import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AgendaCalendarView } from '@/types/negocio/agenda.types'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import {
  addDaysToDateOnlyAgenda,
  toDateOnlyStringAgenda,
} from '@/utils/formatters'
import {
  calendarDateRangeIso,
  formatAgendaCalendarDayTitle,
  formatAgendaCalendarMonthTitle,
  formatAgendaCalendarRangeLabel,
  isValidDateOnly,
  monthBounds,
  parseAgendaCalendarView,
  shiftAgendaMonth,
  weekBounds,
} from '@/utils/agendaCalendar'

export function useAgendaCalendar() {
  const route = useRoute()
  const router = useRouter()

  const view = ref<AgendaCalendarView>(resolveInitialView())
  const cursorDate = ref(resolveInitialDate())
  const syncingQuery = ref(false)

  const today = computed(() => toDateOnlyStringAgenda())

  const visibleRange = computed(() => {
    if (view.value === 'dia') return { inicio: cursorDate.value, fim: cursorDate.value }
    if (view.value === 'semana') return weekBounds(cursorDate.value)
    return monthBounds(cursorDate.value)
  })

  const apiDateRange = computed(() => calendarDateRangeIso(view.value, cursorDate.value))

  const title = computed(() => {
    if (view.value === 'dia') return formatAgendaCalendarDayTitle(cursorDate.value)
    return formatAgendaCalendarMonthTitle(cursorDate.value)
  })

  const rangeLabel = computed(() =>
    formatAgendaCalendarRangeLabel(visibleRange.value.inicio, visibleRange.value.fim),
  )

  const subtitle = computed(() => {
    if (view.value === 'dia') return 'Horários do dia, com duração de cada atendimento.'
    if (view.value === 'semana') return 'Horários da semana com duração de cada atendimento.'
    return 'Visão mensal dos agendamentos. Clique em um dia para abrir a grade.'
  })

  function resolveInitialView(): AgendaCalendarView {
    const fromQuery = parseAgendaCalendarView(route.query.visao) ?? parseAgendaCalendarView(route.query.periodo)
    if (fromQuery) return fromQuery
    if (route.name === ROUTE_NAMES.AGENDA_SEMANA) return 'semana'
    if (route.name === ROUTE_NAMES.AGENDA_DIA) return 'dia'
    if (route.name === ROUTE_NAMES.AGENDA_MES) return 'mes'
    return 'mes'
  }

  function resolveInitialDate(): string {
    return isValidDateOnly(route.query.data) ? route.query.data : toDateOnlyStringAgenda()
  }

  function setView(next: AgendaCalendarView) {
    view.value = next
  }

  function goToday() {
    cursorDate.value = toDateOnlyStringAgenda()
  }

  function goPrev() {
    if (view.value === 'mes') {
      cursorDate.value = shiftAgendaMonth(cursorDate.value, -1)
      return
    }
    cursorDate.value = addDaysToDateOnlyAgenda(cursorDate.value, view.value === 'semana' ? -7 : -1)
  }

  function goNext() {
    if (view.value === 'mes') {
      cursorDate.value = shiftAgendaMonth(cursorDate.value, 1)
      return
    }
    cursorDate.value = addDaysToDateOnlyAgenda(cursorDate.value, view.value === 'semana' ? 7 : 1)
  }

  function selectDate(iso: string, nextView?: AgendaCalendarView) {
    if (!isValidDateOnly(iso)) return
    cursorDate.value = iso
    if (nextView) view.value = nextView
  }

  watch(
    () => [route.query.visao, route.query.periodo, route.query.data, route.name] as const,
    () => {
      if (syncingQuery.value) return
      const nextView = parseAgendaCalendarView(route.query.visao) ?? parseAgendaCalendarView(route.query.periodo)
      if (nextView && nextView !== view.value) view.value = nextView
      if (isValidDateOnly(route.query.data) && route.query.data !== cursorDate.value) {
        cursorDate.value = route.query.data
      }
    },
  )

  watch([view, cursorDate], async () => {
    const { periodo: _ignoredPeriodo, ...currentQuery } = route.query
    void _ignoredPeriodo
    const nextQuery = { ...currentQuery, visao: view.value, data: cursorDate.value }
    const same =
      route.query.visao === view.value &&
      route.query.data === cursorDate.value &&
      route.query.periodo == null
    if (same) return
    syncingQuery.value = true
    try {
      await router.replace({ path: ROUTE_PATHS.AGENDA, query: nextQuery })
    } finally {
      syncingQuery.value = false
    }
  }, { immediate: true })

  return {
    view,
    cursorDate,
    today,
    visibleRange,
    apiDateRange,
    title,
    rangeLabel,
    subtitle,
    setView,
    goToday,
    goPrev,
    goNext,
    selectDate,
  }
}
