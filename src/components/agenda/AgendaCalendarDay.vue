<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { AgendaCalendarEvent, AgendaCalendarResource } from '@/types/negocio/agenda.types'
import { eventsForResource, uniqueResourcesFromEvents } from '@/utils/agendaCalendar'
import AgendaCalendarTimeGrid, {
  type AgendaCalendarColumn,
} from '@/components/agenda/AgendaCalendarTimeGrid.vue'

const props = defineProps<{
  cursorDate: string
  events: AgendaCalendarEvent[]
  resources: AgendaCalendarResource[]
  singleColumn?: boolean
}>()

const emit = defineEmits<{
  select: [event: AgendaCalendarEvent]
}>()

const isMobile = ref(false)
const selectedKey = ref('')

const allColumns = computed<AgendaCalendarColumn[]>(() => {
  if (props.singleColumn) {
    return [
      {
        key: 'propria',
        label: 'Minha agenda',
        dateIso: props.cursorDate,
        events: props.events,
      },
    ]
  }

  const resources =
    props.resources.length > 0 ? props.resources : uniqueResourcesFromEvents(props.events)

  const columns: AgendaCalendarColumn[] =
    resources.length === 0
      ? [
          {
            key: 'vazio',
            label: 'Equipe',
            dateIso: props.cursorDate,
            events: props.events,
          },
        ]
      : resources.map((resource) => ({
          key: String(resource.id),
          label: resource.nome,
          dateIso: props.cursorDate,
          events: eventsForResource(props.events, resource.id),
        }))

  const unassigned = props.events.filter((event) => !event.profissionalId)
  if (resources.length > 0 && unassigned.length > 0) {
    columns.push({
      key: 'outros',
      label: 'Sem profissional',
      dateIso: props.cursorDate,
      events: unassigned,
    })
  }

  return columns
})

const showPeoplePicker = computed(() => isMobile.value && allColumns.value.length > 1)

const columns = computed(() => {
  if (!showPeoplePicker.value) return allColumns.value
  const selected = allColumns.value.find((column) => column.key === selectedKey.value)
  return selected ? [selected] : allColumns.value.slice(0, 1)
})

watch(
  allColumns,
  (next) => {
    if (next.some((column) => column.key === selectedKey.value)) return
    const withEvents = next.find((column) => column.events.length > 0)
    selectedKey.value = (withEvents ?? next[0])?.key ?? ''
  },
  { immediate: true },
)

let media: MediaQueryList | null = null

function syncMobile() {
  isMobile.value = media?.matches ?? false
}

onMounted(() => {
  media = window.matchMedia('(max-width: 639px)')
  syncMobile()
  media.addEventListener('change', syncMobile)
})

onUnmounted(() => {
  media?.removeEventListener('change', syncMobile)
})
</script>

<template>
  <div class="agenda-cal-day">
    <div v-if="showPeoplePicker" class="agenda-cal-people" role="tablist" aria-label="Profissionais">
      <button
        v-for="column in allColumns"
        :key="column.key"
        type="button"
        role="tab"
        class="agenda-cal-people__chip"
        :class="{ 'agenda-cal-people__chip--active': column.key === selectedKey }"
        :aria-selected="column.key === selectedKey"
        @click="selectedKey = column.key"
      >
        <span class="agenda-cal-people__name">{{ column.label }}</span>
        <span v-if="column.events.length" class="agenda-cal-people__count">{{ column.events.length }}</span>
      </button>
    </div>

    <AgendaCalendarTimeGrid
      :columns="columns"
      grid-label="Calendário do dia"
      heading="resource"
      @select="emit('select', $event)"
    />
  </div>
</template>
