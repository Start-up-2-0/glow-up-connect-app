<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendaPageHeader from '@/components/agenda/AgendaPageHeader.vue'
import AgendaFigmaFilter from '@/components/agenda/AgendaFigmaFilter.vue'
import AgendaStatusFilterIcon from '@/components/agenda/AgendaStatusFilterIcon.vue'
import AgendaCalendarMonth from '@/components/agenda/AgendaCalendarMonth.vue'
import AgendaCalendarWeek from '@/components/agenda/AgendaCalendarWeek.vue'
import AgendaCalendarDay from '@/components/agenda/AgendaCalendarDay.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { AGENDA_CALENDAR_MAX_PAGES, AGENDA_CALENDAR_PAGE_SIZE } from '@/constants/agendaFilters'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAgendaCalendar } from '@/composables/useAgendaCalendar'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { equipeService } from '@/services/equipeService'
import type {
  AgendaCalendarEvent,
  AgendaCalendarResource,
  AgendaCalendarView,
  AgendaFiltro,
  AgendaPaginada,
} from '@/types/negocio/agenda.types'
import { agendaDetalhePath } from '@/constants/routes'
import { AGENDA_STATUS_FILTER_OPTIONS, resolveAgendamentoStatusTheme } from '@/utils/agendamentoStatusTheme'
import { AGENDA_CALENDAR_VIEW_OPTIONS, toCalendarEventsFromGeral, toCalendarEventsFromPropria } from '@/utils/agendaCalendar'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const { startPageTutorial } = usePageTutorial('agenda')
const {
  view,
  cursorDate,
  title,
  rangeLabel,
  subtitle,
  apiDateRange,
  setView,
  goToday,
  goPrev,
  goNext,
  selectDate,
} = useAgendaCalendar()

const statusFilter = ref('')
const events = ref<AgendaCalendarEvent[]>([])
const resources = ref<AgendaCalendarResource[]>([])
const loading = ref(false)
const total = ref(0)

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))
const statusOptions = AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))
const viewOptions = AGENDA_CALENDAR_VIEW_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

const statusSummary = computed(() => {
  const groups = new Map<string, number>()
  for (const event of events.value) {
    const key = event.status === 'Agendado' ? 'Confirmado' : event.status
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  return AGENDA_STATUS_FILTER_OPTIONS
    .filter((option) => option.value && groups.has(option.value))
    .map((option) => ({
      value: option.value,
      label: option.label,
      count: groups.get(option.value) ?? 0,
      className: resolveAgendamentoStatusTheme(option.value).pillClass,
    }))
})

const apiFiltro = computed<AgendaFiltro>(() => ({
  inicio: apiDateRange.value.inicio,
  fim: apiDateRange.value.fim,
  pagina: 1,
  tamanhoPagina: AGENDA_CALENDAR_PAGE_SIZE,
  ordenacao: 'atendimento_asc',
  ...(statusFilter.value ? { status: statusFilter.value } : {}),
}))

async function loadAllPages<T>(
  fetchPage: (pagina: number) => Promise<AgendaPaginada<T>>,
): Promise<T[]> {
  const first = await fetchPage(1)
  const items = [...first.itens]
  const pageSize = first.tamanhoPagina || AGENDA_CALENDAR_PAGE_SIZE
  const totalPages = Math.min(
    AGENDA_CALENDAR_MAX_PAGES,
    Math.max(1, Math.ceil(first.total / pageSize)),
  )
  total.value = first.total
  for (let pagina = 2; pagina <= totalPages; pagina += 1) {
    const next = await fetchPage(pagina)
    items.push(...next.itens)
  }
  return items
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (visaoGeral.value) {
      const itens = await loadAllPages((pagina) =>
        agendaNegocioService.listarGeral(estabelecimentoId.value!, { ...apiFiltro.value, pagina }),
      )
      events.value = toCalendarEventsFromGeral(itens)
    } else {
      const itens = await loadAllPages((pagina) =>
        agendaNegocioService.listarPropria(estabelecimentoId.value!, { ...apiFiltro.value, pagina }),
      )
      events.value = toCalendarEventsFromPropria(itens)
    }
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar a agenda.'))
  } finally {
    loading.value = false
  }
}

async function loadResources() {
  if (!visaoGeral.value || !estabelecimentoId.value) {
    resources.value = []
    return
  }
  try {
    const list = await equipeService.listarProfissionais(estabelecimentoId.value)
    resources.value = list
      .filter((profissional) => profissional.ativo)
      .map((profissional) => ({
        id: profissional.profissionalId,
        nome: profissional.nomePublico,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  } catch {
    resources.value = []
  }
}

function onSelectEvent(event: AgendaCalendarEvent) {
  void router.push(agendaDetalhePath(event.id))
}

function onSelectDay(iso: string) {
  selectDate(iso, 'dia')
}

function onViewChange(value: string) {
  setView(value as AgendaCalendarView)
}

watch(
  ready,
  (isReady) => {
    if (!isReady) return
    void load()
    void loadResources()
  },
  { immediate: true },
)

watch([statusFilter, apiDateRange], () => {
  if (ready.value) void load()
})
</script>

<template>
  <div class="agenda-page agenda-page--calendar">
    <AgendaPageHeader :title="title" :subtitle="subtitle" :date-label="rangeLabel">
      <template #actions>
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
        <div class="agenda-cal-nav" data-tour="agenda-nav" role="group" aria-label="Navegar no calendário">
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" aria-label="Período anterior" @click="goPrev">
            <span aria-hidden="true">‹</span>
          </BaseButton>
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" @click="goToday">Hoje</BaseButton>
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" aria-label="Próximo período" @click="goNext">
            <span aria-hidden="true">›</span>
          </BaseButton>
        </div>
        <div class="agenda-cal-views" data-tour="agenda-views">
          <SegmentedControl
            :model-value="view"
            :options="viewOptions"
            aria-label="Visão da agenda"
            @update:model-value="onViewChange"
          />
        </div>
      </template>
      <template #filters>
        <div data-tour="agenda-status-filter">
          <AgendaFigmaFilter
            v-model="statusFilter"
            label="Filtrar por Status"
            :options="statusOptions"
          >
            <template #icon>
              <AgendaStatusFilterIcon />
            </template>
          </AgendaFigmaFilter>
        </div>
      </template>
    </AgendaPageHeader>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="contextLoading || (loading && events.length === 0)" class="agenda-cal-loading">
      <LoadingSpinner label="Carregando agenda" />
    </div>

    <div v-else class="agenda-cal-shell" data-tour="agenda-calendar" :class="{ 'agenda-cal-shell--busy': loading }">
      <div class="agenda-cal-summary">
        <div>
          <p class="agenda-cal-summary__title">
            {{ total }} {{ total === 1 ? 'agendamento no período' : 'agendamentos no período' }}
          </p>
          <p class="agenda-cal-summary__hint">Selecione um horário para ver os detalhes ou clique no dia para abrir a agenda.</p>
        </div>
        <div v-if="statusSummary.length" class="agenda-cal-legend" aria-label="Legenda dos status">
          <span v-for="item in statusSummary" :key="item.value" class="agenda-cal-legend__item">
            <span class="agenda-cal-legend__dot" :class="item.className" aria-hidden="true" />
            {{ item.label }}
            <strong>{{ item.count }}</strong>
          </span>
        </div>
      </div>

      <p v-if="!loading && events.length === 0" class="agenda-cal-empty">
        Nenhum agendamento neste período.
      </p>

      <AgendaCalendarMonth
        v-if="view === 'mes'"
        :cursor-date="cursorDate"
        :events="events"
        @select="onSelectEvent"
        @select-day="onSelectDay"
      />
      <AgendaCalendarWeek
        v-else-if="view === 'semana'"
        :cursor-date="cursorDate"
        :events="events"
        @select="onSelectEvent"
      />
      <AgendaCalendarDay
        v-else
        :cursor-date="cursorDate"
        :events="events"
        :resources="resources"
        :single-column="!visaoGeral"
        @select="onSelectEvent"
      />

      <p class="agenda-cal-count">Horários exibidos no fuso local do estabelecimento.</p>
    </div>
  </div>
</template>
