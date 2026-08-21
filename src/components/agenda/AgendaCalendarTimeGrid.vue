<script setup lang="ts">
import { computed } from 'vue'
import type { AgendaCalendarEvent } from '@/types/negocio/agenda.types'
import {
  AGENDA_CALENDAR_HOUR_HEIGHT,
  AGENDA_CALENDAR_WEEKDAYS,
  agendaNowMinutes,
  layoutOverlappingEvents,
  resolveTimeRange,
} from '@/utils/agendaCalendar'
import { toDateOnlyStringAgenda } from '@/utils/formatters'
import AgendaCalendarEventCard from '@/components/agenda/AgendaCalendarEventCard.vue'

export interface AgendaCalendarColumn {
  key: string
  label: string
  caption?: string
  dateIso?: string
  events: AgendaCalendarEvent[]
}

const props = withDefaults(
  defineProps<{
    columns: AgendaCalendarColumn[]
    gridLabel: string
    heading?: 'date' | 'resource'
  }>(),
  { heading: 'date' },
)

const emit = defineEmits<{
  select: [event: AgendaCalendarEvent]
}>()

const isResource = computed(() => props.heading === 'resource')
const todayIso = computed(() => toDateOnlyStringAgenda())
const allEvents = computed(() => props.columns.flatMap((column) => column.events))
const hasToday = computed(() => props.columns.some((column) => column.dateIso === todayIso.value))
const firstTodayIndex = computed(() =>
  props.columns.findIndex((column) => column.dateIso === todayIso.value),
)
const timeRange = computed(() => resolveTimeRange(allEvents.value, hasToday.value))

const hours = computed(() => {
  const list: number[] = []
  for (let hour = timeRange.value.startHour; hour < timeRange.value.endHour; hour += 1) {
    list.push(hour)
  }
  return list
})

const bodyHeight = computed(() => hours.value.length * AGENDA_CALENDAR_HOUR_HEIGHT)

const nowTop = computed(() => {
  const minutes = agendaNowMinutes()
  const start = timeRange.value.startHour * 60
  const end = timeRange.value.endHour * 60
  if (minutes < start || minutes > end) return null
  return ((minutes - start) / 60) * AGENDA_CALENDAR_HOUR_HEIGHT
})

const nowLabel = computed(() => {
  const minutes = agendaNowMinutes()
  const hoursPart = String(Math.floor(minutes / 60)).padStart(2, '0')
  const minsPart = String(minutes % 60).padStart(2, '0')
  return `${hoursPart}:${minsPart}`
})

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function weekdayFromIso(iso?: string): string {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const index = (date.getDay() + 6) % 7
  return AGENDA_CALENDAR_WEEKDAYS[index] ?? ''
}

function dayNumber(iso?: string): string {
  if (!iso) return ''
  return String(Number(iso.slice(8, 10)))
}

function isTodayColumn(column: AgendaCalendarColumn): boolean {
  return !isResource.value && column.dateIso === todayIso.value
}

const gridStyle = computed(() => ({
  '--agenda-cal-cols': String(props.columns.length),
  gridTemplateColumns: `var(--agenda-cal-gutter) repeat(${props.columns.length}, minmax(var(--agenda-cal-col), 1fr))`,
}))

function positioned(events: AgendaCalendarEvent[]) {
  const start = timeRange.value.startHour * 60
  return layoutOverlappingEvents(events).map((item) => {
    const top = ((item.startMin - start) / 60) * AGENDA_CALENDAR_HOUR_HEIGHT
    const height = Math.max(
      ((item.endMin - item.startMin) / 60) * AGENDA_CALENDAR_HOUR_HEIGHT,
      28,
    )
    const width = 100 / item.columnCount
    return {
      ...item,
      style: {
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${item.column * width}% + 3px)`,
        width: `calc(${width}% - 6px)`,
      },
    }
  })
}
</script>

<template>
  <div
    class="agenda-cal-time"
    :class="isResource ? 'agenda-cal-time--resource' : 'agenda-cal-time--date'"
    :aria-label="gridLabel"
  >
    <div class="agenda-cal-time__head" :style="gridStyle">
      <div class="agenda-cal-time__gutter" />
      <div
        v-for="column in columns"
        :key="column.key"
        class="agenda-cal-time__col-head"
        :class="{ 'agenda-cal-time__col-head--today': isTodayColumn(column) }"
      >
        <template v-if="heading === 'date'">
          <p class="agenda-cal-time__dow">{{ weekdayFromIso(column.dateIso) }}</p>
          <p class="agenda-cal-time__col-label">{{ dayNumber(column.dateIso) }}</p>
        </template>
        <template v-else>
          <p class="agenda-cal-time__col-label agenda-cal-time__col-label--resource">{{ column.label }}</p>
          <p v-if="column.caption" class="agenda-cal-time__col-caption">{{ column.caption }}</p>
        </template>
      </div>
    </div>

    <div
      class="agenda-cal-time__body"
      :style="{
        ...gridStyle,
        height: `${bodyHeight}px`,
      }"
    >
      <div class="agenda-cal-time__hours">
        <div
          v-for="hour in hours"
          :key="hour"
          class="agenda-cal-time__hour"
          :style="{ height: `${AGENDA_CALENDAR_HOUR_HEIGHT}px` }"
        >
          {{ hourLabel(hour) }}
        </div>
      </div>

      <div
        v-for="(column, columnIndex) in columns"
        :key="column.key"
        class="agenda-cal-time__col"
        :class="{ 'agenda-cal-time__col--today': isTodayColumn(column) }"
      >
        <div
          v-for="hour in hours"
          :key="`${column.key}-${hour}`"
          class="agenda-cal-time__slot"
          :style="{ height: `${AGENDA_CALENDAR_HOUR_HEIGHT}px` }"
        />

        <AgendaCalendarEventCard
          v-for="item in positioned(column.events)"
          :key="`${item.event.id}-${item.event.agendamentoItemId ?? 0}`"
          class="agenda-cal-time__event"
          :event="item.event"
          variant="block"
          :style="item.style"
          @select="emit('select', $event)"
        />

        <div
          v-if="nowTop != null && column.dateIso === todayIso"
          class="agenda-cal-now"
          :style="{ top: `${nowTop}px` }"
        >
          <span v-if="columnIndex === firstTodayIndex" class="agenda-cal-now__badge">{{ nowLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
