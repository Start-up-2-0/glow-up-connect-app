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
import { AGENDA_CALENDAR_MAX_PAGES, AGENDA_CALENDAR_PAGE_SIZE } from '@/constants/agendaFilters'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAgendaCalendar } from '@/composables/useAgendaCalendar'
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
import { AGENDA_STATUS_FILTER_OPTIONS } from '@/utils/agendamentoStatusTheme'
import { AGENDA_CALENDAR_VIEW_OPTIONS, toCalendarEventsFromGeral, toCalendarEventsFromPropria } from '@/utils/agendaCalendar'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
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
        <div class="agenda-cal-nav" role="group" aria-label="Navegar no calendário">
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" aria-label="Período anterior" @click="goPrev">
            <span aria-hidden="true">‹</span>
          </BaseButton>
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" @click="goToday">Hoje</BaseButton>
          <BaseButton variant="ghost" size="sm" class="min-w-9 shadow-none" aria-label="Próximo período" @click="goNext">
            <span aria-hidden="true">›</span>
          </BaseButton>
        </div>
        <div class="agenda-cal-views">
          <SegmentedControl
            :model-value="view"
            :options="viewOptions"
            aria-label="Visão da agenda"
            @update:model-value="onViewChange"
          />
        </div>
      </template>
      <template #filters>
        <AgendaFigmaFilter
          v-model="statusFilter"
          label="Filtrar por Status"
          :options="statusOptions"
        >
          <template #icon>
            <AgendaStatusFilterIcon />
          </template>
        </AgendaFigmaFilter>
      </template>
    </AgendaPageHeader>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="contextLoading || (loading && events.length === 0)" class="agenda-cal-loading">
      <LoadingSpinner label="Carregando agenda" />
    </div>

    <div v-else class="agenda-cal-shell" :class="{ 'agenda-cal-shell--busy': loading }">
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

      <p class="agenda-cal-count">
        {{ total }} {{ total === 1 ? 'agendamento' : 'agendamentos' }}
      </p>
    </div>
  </div>
</template>
