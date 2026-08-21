<script setup lang="ts">
import { computed } from 'vue'
import type { AgendaCalendarEvent } from '@/types/negocio/agenda.types'
import { formatAgendaTime } from '@/utils/formatters'
import { formatEventTimeRange } from '@/utils/agendaCalendar'
import { resolveAgendamentoStatusTheme } from '@/utils/agendamentoStatusTheme'

const props = withDefaults(
  defineProps<{
    event: AgendaCalendarEvent
    variant?: 'pill' | 'block'
  }>(),
  { variant: 'pill' },
)

const emit = defineEmits<{
  select: [event: AgendaCalendarEvent]
}>()

const theme = computed(() => resolveAgendamentoStatusTheme(props.event.status))
const cancelled = computed(() => props.event.status === 'Cancelado')
</script>

<template>
  <button
    type="button"
    class="agenda-cal-event"
    :class="[theme.pillClass, `agenda-cal-event--${variant}`, cancelled ? 'agenda-cal-event--cancelled' : '']"
    :title="`${event.clienteNome} · ${event.servicoNome} · ${formatEventTimeRange(event)}`"
    @click.stop="emit('select', event)"
  >
    <template v-if="variant === 'pill'">
      <span class="agenda-cal-event__time">{{ formatAgendaTime(event.inicio) }}</span>
      <span class="agenda-cal-event__title">{{ event.clienteNome }}</span>
    </template>
    <template v-else>
      <span class="agenda-cal-event__title">{{ event.clienteNome }}</span>
      <span v-if="event.servicoNome" class="agenda-cal-event__meta">{{ event.servicoNome }}</span>
      <span class="agenda-cal-event__meta">{{ formatEventTimeRange(event) }}</span>
    </template>
  </button>
</template>
