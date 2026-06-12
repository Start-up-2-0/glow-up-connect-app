<script setup lang="ts">
import { computed, useId } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendaCalendarFilterIcon from '@/components/agenda/AgendaCalendarFilterIcon.vue'
import type { SlotDisponivel } from '@/types/agendamento.types'
import { formatAgendaTime, formatDateOnlyFigma } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    title: string
    slots: SlotDisponivel[]
    slotsLoading?: boolean
    confirmLoading?: boolean
    primaryLabel?: string
    secondaryLabel?: string
    slotsEmptyMessage?: string
  }>(),
  {
    slotsLoading: false,
    confirmLoading: false,
    primaryLabel: 'Confirmar remarcação',
    secondaryLabel: 'Voltar',
    slotsEmptyMessage: 'Nenhum horário disponível nesta data.',
  },
)

const date = defineModel<string>('date', { required: true })
const motivo = defineModel<string>('motivo', { default: '' })
const selectedSlotInicio = defineModel<string | null>('selectedSlotInicio', { default: null })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dateInputId = useId()
const motivoInputId = useId()

const formattedDate = computed(() =>
  date.value ? formatDateOnlyFigma(date.value) : 'Selecione a data',
)

const canConfirm = computed(
  () => Boolean(selectedSlotInicio.value && motivo.value.trim() && date.value),
)

function selectSlot(slot: SlotDisponivel) {
  selectedSlotInicio.value = slot.inicio
}
</script>

<template>
  <section class="remarcar-agendamento" aria-labelledby="remarcar-agendamento-title">
    <h2 id="remarcar-agendamento-title" class="remarcar-agendamento__title">
      {{ title }}
    </h2>

    <div class="remarcar-agendamento__panel">
      <div class="remarcar-agendamento__layout">
        <div class="remarcar-agendamento__left">
          <label class="remarcar-agendamento__label" :for="dateInputId">
            Escolha uma nova data
          </label>

          <div class="remarcar-agendamento__date-field">
            <span
              class="remarcar-agendamento__date-value"
              :class="{ 'remarcar-agendamento__date-value--placeholder': !date }"
            >
              {{ formattedDate }}
            </span>
            <AgendaCalendarFilterIcon class="remarcar-agendamento__date-icon" />
            <input
              :id="dateInputId"
              v-model="date"
              type="date"
              class="remarcar-agendamento__date-input"
              aria-label="Escolha uma nova data"
            />
          </div>

          <label class="remarcar-agendamento__label remarcar-agendamento__label--spacing">
            Escolha o novo horário
          </label>

          <LoadingSpinner v-if="slotsLoading" />

          <p
            v-else-if="slots.length === 0"
            class="remarcar-agendamento__slots-empty"
          >
            {{ slotsEmptyMessage }}
          </p>

          <div v-else class="remarcar-agendamento__slot-grid" role="listbox" aria-label="Horários disponíveis">
            <button
              v-for="(slot, index) in slots"
              :key="`${slot.inicio}-${index}`"
              type="button"
              role="option"
              class="remarcar-agendamento__slot-btn"
              :class="{ 'remarcar-agendamento__slot-btn--selected': selectedSlotInicio === slot.inicio }"
              :aria-selected="selectedSlotInicio === slot.inicio"
              @click="selectSlot(slot)"
            >
              {{ formatAgendaTime(slot.inicio) }}
            </button>
          </div>
        </div>

        <div class="remarcar-agendamento__right">
          <label class="remarcar-agendamento__label remarcar-agendamento__label--motivo" :for="motivoInputId">
            Motivo da remarcação
          </label>

          <textarea
            :id="motivoInputId"
            v-model="motivo"
            rows="4"
            class="remarcar-agendamento__motivo"
            placeholder="Descreva o motivo da remarcação"
          />

          <div class="remarcar-agendamento__actions">
            <button
              type="button"
              class="remarcar-agendamento__btn remarcar-agendamento__btn--primary"
              :disabled="confirmLoading || !canConfirm"
              @click="emit('confirm')"
            >
              {{ primaryLabel }}
            </button>
            <button
              type="button"
              class="remarcar-agendamento__btn remarcar-agendamento__btn--secondary"
              :disabled="confirmLoading"
              @click="emit('cancel')"
            >
              {{ secondaryLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
