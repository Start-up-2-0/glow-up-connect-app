<script setup lang="ts">
import { computed } from 'vue'
import type { AgendaCalendarEvent } from '@/types/negocio/agenda.types'
import { addDaysToDateOnlyAgenda } from '@/utils/formatters'
import { groupEventsByDate, weekBounds } from '@/utils/agendaCalendar'
import AgendaCalendarTimeGrid, {
  type AgendaCalendarColumn,
} from '@/components/agenda/AgendaCalendarTimeGrid.vue'

const props = defineProps<{
  cursorDate: string
  events: AgendaCalendarEvent[]
}>()

const emit = defineEmits<{
  select: [event: AgendaCalendarEvent]
}>()

const columns = computed<AgendaCalendarColumn[]>(() => {
  const { inicio } = weekBounds(props.cursorDate)
  const grouped = groupEventsByDate(props.events)
  return Array.from({ length: 7 }, (_, index) => {
    const iso = addDaysToDateOnlyAgenda(inicio, index)
    return {
      key: iso,
      label: iso,
      dateIso: iso,
      events: grouped.get(iso) ?? [],
    }
  })
})
</script>

<template>
  <AgendaCalendarTimeGrid
    :columns="columns"
    grid-label="Calendário semanal"
    heading="date"
    @select="emit('select', $event)"
  />
</template>
