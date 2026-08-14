<script setup lang="ts">
import { computed } from 'vue'
import type { AgendaCalendarEvent } from '@/types/negocio/agenda.types'
import {
  AGENDA_CALENDAR_MONTH_VISIBLE_EVENTS,
  AGENDA_CALENDAR_WEEKDAYS,
  buildMonthGrid,
  groupEventsByDate,
} from '@/utils/agendaCalendar'
import { resolveAgendamentoStatusTheme } from '@/utils/agendamentoStatusTheme'
import AgendaCalendarEventCard from '@/components/agenda/AgendaCalendarEventCard.vue'

const props = defineProps<{
  cursorDate: string
  events: AgendaCalendarEvent[]
}>()

const emit = defineEmits<{
  select: [event: AgendaCalendarEvent]
  selectDay: [iso: string]
}>()

const cells = computed(() => buildMonthGrid(props.cursorDate))
const grouped = computed(() => groupEventsByDate(props.events))

function eventsFor(iso: string): AgendaCalendarEvent[] {
  return grouped.value.get(iso) ?? []
}

function visibleEvents(iso: string): AgendaCalendarEvent[] {
  return eventsFor(iso).slice(0, AGENDA_CALENDAR_MONTH_VISIBLE_EVENTS)
}

function hiddenCount(iso: string): number {
  return Math.max(0, eventsFor(iso).length - AGENDA_CALENDAR_MONTH_VISIBLE_EVENTS)
}

function dotsFor(iso: string): AgendaCalendarEvent[] {
  return eventsFor(iso).slice(0, 3)
}

function hasExtraDots(iso: string): boolean {
  return eventsFor(iso).length > 3
}

function onCellKeydown(event: KeyboardEvent, iso: string) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  emit('selectDay', iso)
}
</script>

<template>
  <div class="agenda-cal-month" role="grid" aria-label="Calendário mensal">
    <div class="agenda-cal-month__weekdays">
      <span v-for="weekday in AGENDA_CALENDAR_WEEKDAYS" :key="weekday">
        <abbr class="agenda-cal-month__dow-short" :title="weekday">{{ weekday.slice(0, 1) }}</abbr>
        <span class="agenda-cal-month__dow-full">{{ weekday }}</span>
      </span>
    </div>
    <div class="agenda-cal-month__grid">
      <div
        v-for="cell in cells"
        :key="cell.iso"
        class="agenda-cal-month__cell"
        :class="{
          'agenda-cal-month__cell--muted': !cell.inMonth,
          'agenda-cal-month__cell--today': cell.isToday,
        }"
        role="gridcell"
      >
        <div
          class="agenda-cal-month__hit"
          role="button"
          tabindex="0"
          :aria-label="`Ver agenda de ${cell.iso}`"
          :aria-current="cell.isToday ? 'date' : undefined"
          @click="emit('selectDay', cell.iso)"
          @keydown="onCellKeydown($event, cell.iso)"
        >
          <span class="agenda-cal-month__day">{{ cell.day }}</span>
          <div class="agenda-cal-month__dots" aria-hidden="true">
            <span
              v-for="event in dotsFor(cell.iso)"
              :key="`${event.id}-${event.agendamentoItemId ?? 0}`"
              class="agenda-cal-month__dot"
              :class="resolveAgendamentoStatusTheme(event.status).pillClass"
            />
            <span v-if="hasExtraDots(cell.iso)" class="agenda-cal-month__dot-more">+</span>
          </div>
        </div>

        <div class="agenda-cal-month__events" @click.stop>
          <AgendaCalendarEventCard
            v-for="event in visibleEvents(cell.iso)"
            :key="`${event.id}-${event.agendamentoItemId ?? 0}`"
            :event="event"
            variant="pill"
            @select="emit('select', $event)"
          />
          <button
            v-if="hiddenCount(cell.iso) > 0"
            type="button"
            class="agenda-cal-month__more"
            @click="emit('selectDay', cell.iso)"
          >
            +{{ hiddenCount(cell.iso) }} mais
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
