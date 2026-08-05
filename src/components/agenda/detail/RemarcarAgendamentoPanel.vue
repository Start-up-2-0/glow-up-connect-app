<script setup lang="ts">
import { computed, useId } from 'vue'
import AgendarCalendario from '@/components/agendar/AgendarCalendario.vue'
import type { SlotDisponivel } from '@/types/agendamento.types'
import { formatAgendaTime } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    title: string
    slots: SlotDisponivel[]
    datasAtendimento: string[]
    minDate: string
    maxDate: string
    datasLoading?: boolean
    slotsLoading?: boolean
    confirmLoading?: boolean
    primaryLabel?: string
    secondaryLabel?: string
    mensagemIndisponibilidade?: string | null
    slotsEmptyMessage?: string
  }>(),
  {
    datasLoading: false,
    slotsLoading: false,
    confirmLoading: false,
    primaryLabel: 'Confirmar remarcação',
    secondaryLabel: 'Voltar',
    mensagemIndisponibilidade: null,
    slotsEmptyMessage: 'Nenhum horário livre nesta data. Escolha outro dia da agenda do profissional.',
  },
)

const date = defineModel<string>('date', { required: true })
const motivo = defineModel<string>('motivo', { default: '' })
const selectedSlotInicio = defineModel<string | null>('selectedSlotInicio', { default: null })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const motivoInputId = useId()

const calendarLoading = computed(() => props.datasLoading || props.slotsLoading)

const slotsMessage = computed(() => {
  if (props.mensagemIndisponibilidade && props.datasAtendimento.length === 0) {
    return props.mensagemIndisponibilidade
  }
  if (props.mensagemIndisponibilidade && props.slots.length === 0) {
    return props.mensagemIndisponibilidade
  }
  return props.slotsEmptyMessage
})

const canConfirm = computed(
  () => Boolean(selectedSlotInicio.value && motivo.value.trim() && date.value),
)

function selectSlot(slot: SlotDisponivel) {
  selectedSlotInicio.value = slot.inicio
}

function onSelectDate(value: string) {
  date.value = value
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
          <p class="remarcar-agendamento__label">
            Escolha uma nova data
          </p>

          <p
            v-if="!datasLoading && datasAtendimento.length === 0"
            class="remarcar-agendamento__slots-empty"
          >
            {{ mensagemIndisponibilidade ?? 'Não há dias de atendimento disponíveis para os serviços deste agendamento.' }}
          </p>

          <AgendarCalendario
            v-else-if="datasAtendimento.length > 0"
            embedded
            :selected-date="date"
            :datas-permitidas="datasAtendimento"
            :min-date="minDate"
            :max-date="maxDate"
            :loading="calendarLoading"
            @select="onSelectDate"
          />

          <p class="remarcar-agendamento__label remarcar-agendamento__label--spacing">
            Escolha o novo horário
          </p>

          <p
            v-if="!slotsLoading && slots.length === 0"
            class="remarcar-agendamento__slots-empty"
          >
            {{ slotsMessage }}
          </p>

          <div v-else-if="slots.length > 0" class="remarcar-agendamento__slot-grid" role="listbox" aria-label="Horários disponíveis">
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
