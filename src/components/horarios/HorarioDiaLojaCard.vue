<script setup lang="ts">
import { computed } from 'vue'
import HorarioStatusBadge from '@/components/horarios/HorarioStatusBadge.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import type { DiaLojaDraft, DiaLojaModo } from '@/composables/useHorarios'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import type { DiaSemanaValue } from '@/constants/diasSemana'

const props = defineProps<{
  dia: DiaSemanaValue
  label: string
  horario: HorarioFuncionamento | null
  modo: DiaLojaModo
  draft: DiaLojaDraft
  saving?: boolean
  readonly?: boolean
  profissionaisVinculados?: number
  exibeProfissionais?: boolean
}>()

const emit = defineEmits<{
  'update:draft': [value: DiaLojaDraft]
  salvar: []
  ativar: []
  desativar: []
  editar: []
  cancelar: []
  profissionais: []
}>()

const inputsEditable = computed(
  () => !props.readonly && props.modo !== 'visualizacao',
)

const modoHint = computed(() => {
  if (props.readonly) return ''
  if (props.modo === 'visualizacao') {
    return 'Horário bloqueado — clique em Editar para alterar.'
  }
  if (props.modo === 'edicao') {
    return 'Editando horário — ajuste e clique em Salvar.'
  }
  return 'Defina o horário comercial e clique em Salvar ou Ativar.'
})

function updateDraft(field: keyof DiaLojaDraft, value: string) {
  emit('update:draft', { ...props.draft, [field]: value })
}
</script>

<template>
  <article
    class="horario-dia-card"
    :class="inputsEditable ? 'horario-dia-card--editavel' : 'horario-dia-card--bloqueado'"
  >
    <div class="horario-dia-card__header">
      <h3 class="horario-dia-card__title">{{ label }}</h3>
      <HorarioStatusBadge v-if="horario" :ativo="horario.ativo" />
      <HorarioStatusBadge v-else :ativo="false" />
    </div>

    <p v-if="modoHint" class="horario-dia-card__hint" :class="{ 'horario-dia-card__hint--editavel': inputsEditable }">
      <svg
        v-if="inputsEditable"
        class="horario-dia-card__hint-icon"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11.333 2.00004L14.0023 4.66938L5.00233 13.6694L1.33398 14.6667L2.33131 11.0027L11.333 2.00004Z"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-else
        class="horario-dia-card__hint-icon"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3.5" y="7" width="9" height="7" rx="1" stroke="currentColor" stroke-width="1.2" />
        <path
          d="M5.5 7V5.5C5.5 3.84315 6.84315 2.5 8.5 2.5C10.1569 2.5 11.5 3.84315 11.5 5.5V7"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
        />
      </svg>
      {{ modoHint }}
    </p>

    <div class="horario-dia-card__fields">
      <div class="horario-field">
        <span class="horario-field__label">Início de funcionamento</span>
        <input
          v-if="inputsEditable"
          type="time"
          class="horario-field__input horario-field__input--editable"
          :value="draft.horaInicio"
          required
          @input="updateDraft('horaInicio', ($event.target as HTMLInputElement).value)"
        />
        <div v-else class="horario-field__value" aria-readonly="true">
          {{ draft.horaInicio }}
        </div>
      </div>
      <div class="horario-field">
        <span class="horario-field__label">Fim de funcionamento</span>
        <input
          v-if="inputsEditable"
          type="time"
          class="horario-field__input horario-field__input--editable"
          :value="draft.horaFim"
          required
          @input="updateDraft('horaFim', ($event.target as HTMLInputElement).value)"
        />
        <div v-else class="horario-field__value" aria-readonly="true">
          {{ draft.horaFim }}
        </div>
      </div>
    </div>

    <button
      v-if="exibeProfissionais"
      type="button"
      class="horario-dia-card__profissionais"
      @click="emit('profissionais')"
    >
      <svg class="horario-dia-card__profissionais-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <path
          d="M2.66699 14C2.66699 11.4227 4.75656 9.33333 7.33366 9.33333H8.66699C11.2441 9.33333 13.3337 11.4227 13.3337 14"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
        />
      </svg>
      Profissionais
      <span v-if="profissionaisVinculados" class="horario-dia-card__profissionais-count">
        {{ profissionaisVinculados }}
      </span>
    </button>

    <div v-if="!readonly" class="horario-dia-card__actions">
      <template v-if="modo === 'visualizacao' && horario">
        <button type="button" class="horarios-btn-outline horarios-btn-outline--block" @click="emit('editar')">
          <ServicoIcons name="edit" />
          Editar
        </button>
        <button
          v-if="horario.ativo"
          type="button"
          class="horarios-btn-outline horarios-btn-outline--block"
          :disabled="saving"
          @click="emit('desativar')"
        >
          <ServicoIcons name="desativar" />
          Desativar
        </button>
        <button
          v-else
          type="button"
          class="horarios-btn-ativar horarios-btn-ativar--block"
          :disabled="saving"
          @click="emit('ativar')"
        >
          <ServicoIcons name="ativar" />
          Ativar
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="horarios-btn-primary horarios-btn-primary--block"
          :disabled="saving"
          @click="emit('salvar')"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8H13M9 4L13 8L9 12"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Salvar
        </button>
        <button
          v-if="modo === 'edicao'"
          type="button"
          class="horarios-btn-outline horarios-btn-outline--block"
          :disabled="saving"
          @click="emit('cancelar')"
        >
          <ServicoIcons name="close" />
          Cancelar
        </button>
        <button
          v-else-if="!horario || !horario.ativo"
          type="button"
          class="horarios-btn-ativar horarios-btn-ativar--block"
          :disabled="saving"
          @click="emit('ativar')"
        >
          <ServicoIcons name="ativar" />
          Ativar
        </button>
      </template>
    </div>
  </article>
</template>
