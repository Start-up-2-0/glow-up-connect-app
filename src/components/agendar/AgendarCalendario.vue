<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AGENDAR_BTN_CONTINUE_CLASS } from '@/constants/designTokens'
import { toDateOnlyString } from '@/utils/formatters'

const props = defineProps<{
  selectedDate: string
  datasPermitidas: string[]
  minDate: string
  maxDate: string
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [date: string]
  continuar: []
}>()

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

const permitidasSet = computed(() => new Set(props.datasPermitidas))

const visibleMonth = ref(parseMonth(props.selectedDate || props.minDate))

watch(
  () => props.selectedDate,
  (value) => {
    if (value) visibleMonth.value = parseMonth(value)
  },
)

function parseMonth(isoDate: string) {
  const [year, month] = isoDate.split('-').map(Number)
  return { year, month }
}

function monthLabel({ year, month }: { year: number; month: number }) {
  const date = new Date(year, month - 1, 1)
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1).replace(' de ', ' - ')
}

function shiftMonth(delta: number) {
  let { year, month } = visibleMonth.value
  month += delta
  if (month < 1) {
    month = 12
    year -= 1
  } else if (month > 12) {
    month = 1
    year += 1
  }
  visibleMonth.value = { year, month }
}

const calendarDays = computed(() => {
  const { year, month } = visibleMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: Array<{ iso: string; day: number; inMonth: boolean } | null> = []
  for (let i = 0; i < startOffset; i += 1) cells.push(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day)
    cells.push({ iso: toDateOnlyString(date), day, inMonth: true })
  }

  return cells
})

function isSelectable(iso: string) {
  return (
    iso >= props.minDate
    && iso <= props.maxDate
    && permitidasSet.value.has(iso)
  )
}

function dayClass(iso: string) {
  const selectable = isSelectable(iso)
  const selected = props.selectedDate === iso
  if (selected) return 'font-satoshi text-sm font-bold text-glow-text'
  if (selectable) return 'font-satoshi text-sm font-bold text-glow-text hover:bg-zinc-100'
  return 'font-satoshi text-sm font-bold text-glow-text/20 cursor-default'
}

function handleSelect(iso: string) {
  if (!isSelectable(iso)) return
  emit('select', iso)
}
</script>

<template>
  <div class="mx-auto w-full max-w-[463px] rounded-xl border-[0.5px] border-glow-text/40 p-5">
    <div class="mb-6 flex items-center justify-between">
      <button
        type="button"
        class="flex size-8 items-center justify-center text-glow-text"
        aria-label="Mês anterior"
        @click="shiftMonth(-1)"
      >
        <svg class="size-3.5" viewBox="0 0 14 24" fill="none" aria-hidden="true">
          <path d="M12 2L2 12L12 22" stroke="currentColor" stroke-width=" 2" stroke-linecap="round" />
        </svg>
      </button>
      <p class="font-satoshi text-xl font-bold text-glow-text">{{ monthLabel(visibleMonth) }}</p>
      <button
        type="button"
        class="flex size-8 items-center justify-center text-glow-text"
        aria-label="Próximo mês"
        @click="shiftMonth(1)"
      >
        <svg class="size-3.5" viewBox="0 0 14 24" fill="none" aria-hidden="true">
          <path d="M2 2L12 12L2 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="mb-2 grid grid-cols-7 gap-1 text-center">
      <span
        v-for="weekday in WEEKDAYS"
        :key="weekday"
        class="font-satoshi text-sm text-glow-text"
      >
        {{ weekday }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center">
      <template v-for="(cell, index) in calendarDays" :key="index">
        <span v-if="!cell" class="h-10" />
        <button
          v-else
          type="button"
          class="flex h-10 items-center justify-center rounded"
          :class="dayClass(cell.iso)"
          :disabled="!isSelectable(cell.iso)"
          :aria-pressed="selectedDate === cell.iso"
          @click="handleSelect(cell.iso)"
        >
          {{ cell.day }}
        </button>
      </template>
    </div>

    <hr class="my-6 border-glow-text/25" />

    <button
      type="button"
      :class="AGENDAR_BTN_CONTINUE_CLASS"
      :disabled="!selectedDate || loading"
      @click="emit('continuar')"
    >
      Continuar
    </button>
  </div>
</template>
