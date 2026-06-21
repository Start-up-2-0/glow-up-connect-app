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
}>()

const emit = defineEmits<{
  'update:draft': [value: DiaLojaDraft]
  salvar: []
  ativar: []
  desativar: []
  editar: []
  cancelar: []
}>()

const inputsDisabled = computed(
  () => props.readonly || (props.modo === 'visualizacao' && props.horario !== null),
)

function updateDraft(field: keyof DiaLojaDraft, value: string) {
  emit('update:draft', { ...props.draft, [field]: value })
}
</script>

<template>
  <article class="horario-dia-card">
    <div class="horario-dia-card__header">
      <h3 class="horario-dia-card__title">{{ label }}</h3>
      <HorarioStatusBadge v-if="horario" :ativo="horario.ativo" />
      <HorarioStatusBadge v-else :ativo="false" />
    </div>

    <div class="horario-dia-card__fields">
      <label class="horario-field">
        <span class="horario-field__label">Início de funcionamento</span>
        <input
          type="time"
          class="horario-field__input"
          :value="draft.horaInicio"
          :disabled="inputsDisabled"
          required
          @input="updateDraft('horaInicio', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="horario-field">
        <span class="horario-field__label">Fim de funcionamento</span>
        <input
          type="time"
          class="horario-field__input"
          :value="draft.horaFim"
          :disabled="inputsDisabled"
          required
          @input="updateDraft('horaFim', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

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
