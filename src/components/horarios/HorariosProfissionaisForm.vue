<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import { DIAS_SEMANA, type DiaSemanaValue } from '@/constants/diasSemana'
import type { ProfissionalHorarioOption } from '@/composables/useHorarios'

defineProps<{
  listaProfissionais: ProfissionalHorarioOption[]
  profissionaisSelecionados: number[]
  diaSemana: DiaSemanaValue
  horaInicio: string
  horaFim: string
  editando: boolean
  todosSelecionados: boolean
  saving: boolean
  mostrarSelecaoProfissionais: boolean
}>()

const emit = defineEmits<{
  'update:diaSemana': [value: DiaSemanaValue]
  'update:horaInicio': [value: string]
  'update:horaFim': [value: string]
  toggleProfissional: [id: number]
  toggleSelecionarTodos: []
  salvar: []
  cancelar: []
}>()
</script>

<template>
  <div class="horarios-prof-form-grid">
    <section v-if="mostrarSelecaoProfissionais" class="horarios-panel horarios-panel--profissionais">
      <h3 class="horarios-panel__title">Profissionais</h3>
      <p class="horarios-panel__hint">
        Selecione um ou mais profissionais para o mesmo dia e horário.
      </p>

      <label class="horarios-checkbox-row">
        <input
          type="checkbox"
          class="horarios-checkbox"
          :checked="todosSelecionados"
          :disabled="editando || listaProfissionais.length === 0"
          @change="emit('toggleSelecionarTodos')"
        />
        <span>Selecionar todos</span>
      </label>

      <div class="horarios-prof-chips-scroll">
        <div class="horarios-prof-chips">
          <label
            v-for="p in listaProfissionais"
            :key="p.profissionalId"
            class="horarios-prof-chip"
            :class="{ 'horarios-prof-chip--selected': profissionaisSelecionados.includes(p.profissionalId) }"
          >
            <input
              type="checkbox"
              class="horarios-checkbox"
              :checked="profissionaisSelecionados.includes(p.profissionalId)"
              :disabled="editando"
              @change="emit('toggleProfissional', p.profissionalId)"
            />
            <span>{{ p.nomePublico }}</span>
          </label>
        </div>
      </div>
    </section>

    <section class="horarios-panel horarios-panel--horario">
      <h3 class="horarios-panel__title">Dia e Horário</h3>
      <p class="horarios-panel__hint">
        Selecione o dia da semana, início e fim de funcionamento.
      </p>

      <div class="horarios-panel__fields">
        <label class="horario-field horario-field--select">
          <span class="horario-field__label">Dia da semana</span>
          <div class="horario-field__select-wrap">
            <select
              class="horario-field__input horario-field__input--select"
              :value="diaSemana"
              @change="emit('update:diaSemana', ($event.target as HTMLSelectElement).value as DiaSemanaValue)"
            >
              <option v-for="dia in DIAS_SEMANA" :key="dia.value" :value="dia.value">
                {{ dia.label }}
              </option>
            </select>
          </div>
        </label>

        <label class="horario-field">
          <span class="horario-field__label">Início de funcionamento</span>
          <input
            type="time"
            class="horario-field__input"
            :value="horaInicio"
            @input="emit('update:horaInicio', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <label class="horario-field">
          <span class="horario-field__label">Fim de funcionamento</span>
          <input
            type="time"
            class="horario-field__input"
            :value="horaFim"
            @input="emit('update:horaFim', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>

      <div class="horarios-panel__actions">
        <button
          type="button"
          class="horarios-btn-primary"
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
          v-if="editando"
          type="button"
          class="horarios-btn-outline"
          :disabled="saving"
          @click="emit('cancelar')"
        >
          <ServicoIcons name="close" />
          Cancelar
        </button>
      </div>
    </section>
  </div>
</template>
