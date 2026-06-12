<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AGENDAR_BTN_CONTINUE_CLASS } from '@/constants/designTokens'
import { formatDateOnlyLabel, toDateOnlyString } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    selectedDate: string
    datasPermitidas: string[]
    minDate: string
    maxDate: string
    loading?: boolean
    embedded?: boolean
  }>(),
  {
    loading: false,
    embedded: false,
  },
)

const emit = defineEmits<{
  select: [date: string]
  continuar: []
}>()

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

/** Apenas datas retornadas pela API com slots na agenda do profissional. */
const datasDisponiveis = computed(() =>
  [...props.datasPermitidas].filter(
    (iso) => iso >= props.minDate && iso <= props.maxDate,
  ),
)

const permitidasSet = computed(() => new Set(datasDisponiveis.value))

const visibleMonth = ref(parseMonth(props.selectedDate || props.minDate))

watch(
  () => props.selectedDate,
  (value) => {
    if (value) visibleMonth.value = parseMonth(value)
  },
)

watch(
  datasDisponiveis,
  (datas) => {
    if (datas.length === 0) return
    const primeiraNoMes = datas.find((iso) => {
      const [year, month] = iso.split('-').map(Number)
      return year === visibleMonth.value.year && month === visibleMonth.value.month
    })
    if (!primeiraNoMes) {
      visibleMonth.value = parseMonth(datas[0])
    }
  },
  { immediate: true },
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

  const cells: Array<{ iso: string; day: number } | null> = []
  for (let i = 0; i < startOffset; i += 1) cells.push(null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day)
    cells.push({ iso: toDateOnlyString(date), day })
  }

  return cells
})

const diasDisponiveisNoMes = computed(() =>
  datasDisponiveis.value.filter((iso) => {
    const [year, month] = iso.split('-').map(Number)
    return year === visibleMonth.value.year && month === visibleMonth.value.month
  }).length,
)

function isSelectable(iso: string): boolean {
  return (
    iso >= props.minDate
    && iso <= props.maxDate
    && permitidasSet.value.has(iso)
  )
}

function dayClass(iso: string): string {
  if (!isSelectable(iso)) return 'agendar-calendar-day agendar-calendar-day--muted'
  if (props.selectedDate === iso) {
    return 'agendar-calendar-day agendar-calendar-day--available agendar-calendar-day--selected rounded-md'
  }
  return 'agendar-calendar-day agendar-calendar-day--available'
}

const podeContinuar = computed(
  () => props.selectedDate.length > 0 && isSelectable(props.selectedDate),
)

const continuarLabel = computed(() => {
  if (!podeContinuar.value) return 'Continuar'
  return `Continuar - ${formatDateOnlyLabel(props.selectedDate)}`
})

function handleSelect(iso: string) {
  if (!isSelectable(iso)) return
  emit('select', iso)
}
</script>

<template>
  <div
    class="w-full rounded-xl border-[0.5px] border-glow-border-soft p-5"
    :class="embedded ? 'max-w-full' : 'mx-auto max-w-[463px]'"
  >
    <div class="mb-6 flex items-center justify-between">
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full text-glow-text transition hover:bg-zinc-100"
        aria-label="Mês anterior"
        @click="shiftMonth(-1)"
      >
        <svg class="size-3.5" viewBox="0 0 14 24" fill="none" aria-hidden="true">
          <path d="M12 2L2 12L12 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <p class="font-satoshi text-xl font-bold text-glow-text">{{ monthLabel(visibleMonth) }}</p>
      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-full text-glow-text transition hover:bg-zinc-100"
        aria-label="Próximo mês"
        @click="shiftMonth(1)"
      >
        <svg class="size-3.5" viewBox="0 0 14 24" fill="none" aria-hidden="true">
          <path d="M2 2L12 12L2 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <p
      v-if="diasDisponiveisNoMes > 0"
      class="mb-4 font-urbanist text-xs text-glow-text-subtle"
    >
      {{ diasDisponiveisNoMes }}
      {{ diasDisponiveisNoMes === 1 ? 'dia disponível' : 'dias disponíveis' }}
      neste mês — selecione uma data em destaque.
    </p>

    <div class="mb-2 grid grid-cols-7 gap-1 text-center">
      <span
        v-for="weekday in WEEKDAYS"
        :key="weekday"
        class="font-satoshi text-sm text-glow-text"
      >
        {{ weekday }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Calendário de dias disponíveis">
      <template v-for="(cell, index) in calendarDays" :key="index">
        <span v-if="!cell" class="h-10" role="gridcell" />
        <button
          v-else-if="isSelectable(cell.iso)"
          type="button"
          role="gridcell"
          :class="dayClass(cell.iso)"
          :aria-pressed="selectedDate === cell.iso"
          :aria-label="`Dia ${cell.day}, disponível para agendamento`"
          @click="handleSelect(cell.iso)"
        >
          {{ cell.day }}
        </button>
        <span
          v-else
          role="gridcell"
          :class="dayClass(cell.iso)"
          :aria-label="`Dia ${cell.day}, indisponível`"
        >
          {{ cell.day }}
        </span>
      </template>
    </div>

    <template v-if="!embedded">
      <hr class="my-6 border-glow-border-soft" />

      <button
        type="button"
        :class="AGENDAR_BTN_CONTINUE_CLASS"
        :disabled="!podeContinuar || loading"
        @click="emit('continuar')"
      >
        {{ continuarLabel }}
      </button>
    </template>
  </div>
</template>
