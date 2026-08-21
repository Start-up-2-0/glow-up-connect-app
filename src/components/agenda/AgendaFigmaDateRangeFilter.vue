<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AgendaCalendarFilterIcon from '@/components/agenda/AgendaCalendarFilterIcon.vue'
import type { AgendaCustomDateRange } from '@/types/negocio/agenda.types'
import { EMPTY_AGENDA_CUSTOM_DATE_RANGE } from '@/types/negocio/agenda.types'
import {
  formatAgendaDateRangeLabel,
  hasAgendaCustomDateRange,
  validateAgendaCustomDateRange,
} from '@/utils/agendaDateRange'

const props = withDefaults(
  defineProps<{
    modelValue: AgendaCustomDateRange
    label?: string
    minWidth?: string
  }>(),
  {
    label: 'Filtro Personalizado',
    minWidth: '171px',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: AgendaCustomDateRange]
  apply: [value: AgendaCustomDateRange]
  clear: []
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const draftInicio = ref('')
const draftFim = ref('')

const draftRange = computed<AgendaCustomDateRange>(() => ({
  inicio: draftInicio.value,
  fim: draftFim.value,
}))

const validation = computed(() => validateAgendaCustomDateRange(draftRange.value))

const triggerLabel = computed(() => {
  if (!hasAgendaCustomDateRange(props.modelValue)) return props.label
  return formatAgendaDateRangeLabel(props.modelValue)
})

const hasAppliedValue = computed(() => hasAgendaCustomDateRange(props.modelValue))

const canApply = computed(() => validation.value.valid)

function syncDraftFromModel() {
  draftInicio.value = props.modelValue.inicio
  draftFim.value = props.modelValue.fim
}

watch(
  () => props.modelValue,
  () => {
    if (!open.value) syncDraftFromModel()
  },
  { deep: true },
)

function toggle() {
  open.value = !open.value
  if (open.value) syncDraftFromModel()
}

function apply() {
  if (!canApply.value) return
  const value = { inicio: draftInicio.value, fim: draftFim.value }
  emit('update:modelValue', value)
  emit('apply', value)
  open.value = false
}

function clear() {
  draftInicio.value = ''
  draftFim.value = ''
  emit('update:modelValue', { ...EMPTY_AGENDA_CUSTOM_DATE_RANGE })
  emit('clear')
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div
    ref="rootRef"
    class="agenda-figma-filter"
    :class="{
      'agenda-figma-filter--open': open,
      'agenda-figma-filter--active': hasAppliedValue,
      'agenda-figma-filter--wide': minWidth !== '171px',
    }"
  >
    <button
      type="button"
      class="agenda-figma-filter__trigger"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <AgendaCalendarFilterIcon />
      <span class="agenda-figma-filter__trigger-label">{{ triggerLabel }}</span>
    </button>

    <div v-if="open" class="agenda-figma-filter__panel" role="dialog" aria-label="Filtro personalizado por data">
      <div class="agenda-figma-filter__date-range">
        <div class="agenda-figma-filter__date-range-group">
          <label class="agenda-figma-filter__date-range-label" for="agenda-date-inicio">
            Data inicial
          </label>
          <div class="agenda-figma-filter__date-range-input-wrap">
            <input
              id="agenda-date-inicio"
              v-model="draftInicio"
              type="date"
              class="agenda-figma-filter__date-range-input"
            />
          </div>
        </div>

        <div class="agenda-figma-filter__date-range-group">
          <label class="agenda-figma-filter__date-range-label" for="agenda-date-fim">
            Data final
          </label>
          <div class="agenda-figma-filter__date-range-input-wrap">
            <input
              id="agenda-date-fim"
              v-model="draftFim"
              type="date"
              class="agenda-figma-filter__date-range-input"
            />
          </div>
        </div>

        <p
          v-if="validation.message"
          class="agenda-figma-filter__date-range-error"
          role="alert"
        >
          {{ validation.message }}
        </p>
      </div>

      <div class="agenda-figma-filter__divider" aria-hidden="true" />

      <div class="agenda-figma-filter__actions">
        <button
          type="button"
          class="agenda-figma-filter__apply"
          :disabled="!canApply"
          @click="apply"
        >
          Aplicar
        </button>
        <button
          type="button"
          class="agenda-figma-filter__clear"
          :disabled="!draftInicio && !draftFim && !hasAppliedValue"
          @click="clear"
        >
          Limpar
        </button>
      </div>
    </div>
  </div>
</template>
