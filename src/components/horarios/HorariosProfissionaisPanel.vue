<script setup lang="ts">
import HorarioProfissionalListCard from '@/components/horarios/HorarioProfissionalListCard.vue'
import HorariosProfissionaisForm from '@/components/horarios/HorariosProfissionaisForm.vue'
import type { ProfissionalHorarioOption } from '@/composables/useHorarios'
import type { HorarioProfissional } from '@/types/negocio/horario.types'
import type { DiaSemanaValue } from '@/constants/diasSemana'
import { diaSemanaLabel, horaParaExibicao } from '@/constants/diasSemana'

defineProps<{
  listaProfissionais: ProfissionalHorarioOption[]
  horarios: HorarioProfissional[]
  profissionalSelecionadoId: number | null
  profissionaisFormIds: number[]
  formDiaSemana: DiaSemanaValue
  formHoraInicio: string
  formHoraFim: string
  editando: boolean
  todosSelecionados: boolean
  saving: boolean
  togglingId: number | null
  podeGerenciar: boolean
  mostrarSelecaoProfissionais: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:profissionalSelecionadoId': [value: number | null]
  'update:formDiaSemana': [value: DiaSemanaValue]
  'update:formHoraInicio': [value: string]
  'update:formHoraFim': [value: string]
  toggleProfissional: [id: number]
  toggleSelecionarTodos: []
  salvar: []
  cancelar: []
  editar: [horario: HorarioProfissional]
  ativar: [horario: HorarioProfissional]
  desativar: [horario: HorarioProfissional]
}>()
</script>

<template>
  <section class="horarios-profissionais">
    <h2 class="horarios-section-title">Horários dos profissionais</h2>

    <HorariosProfissionaisForm
      v-if="podeGerenciar"
      :lista-profissionais="listaProfissionais"
      :profissionais-selecionados="profissionaisFormIds"
      :dia-semana="formDiaSemana"
      :hora-inicio="formHoraInicio"
      :hora-fim="formHoraFim"
      :editando="editando"
      :todos-selecionados="todosSelecionados"
      :saving="saving"
      :mostrar-selecao-profissionais="mostrarSelecaoProfissionais"
      @update:dia-semana="emit('update:formDiaSemana', $event)"
      @update:hora-inicio="emit('update:formHoraInicio', $event)"
      @update:hora-fim="emit('update:formHoraFim', $event)"
      @toggle-profissional="emit('toggleProfissional', $event)"
      @toggle-selecionar-todos="emit('toggleSelecionarTodos')"
      @salvar="emit('salvar')"
      @cancelar="emit('cancelar')"
    />

    <div
      v-if="listaProfissionais.length > 0 && mostrarSelecaoProfissionais"
      class="horarios-profissional-filter"
    >
      <label class="horario-field horario-field--select">
        <span class="horario-field__label">Profissional</span>
        <div class="horario-field__select-wrap">
          <select
            class="horario-field__input horario-field__input--select"
            :value="profissionalSelecionadoId ?? ''"
            @change="
              emit(
                'update:profissionalSelecionadoId',
                Number(($event.target as HTMLSelectElement).value) || null,
              )
            "
          >
            <option
              v-for="p in listaProfissionais"
              :key="p.profissionalId"
              :value="p.profissionalId"
            >
              {{ p.nomePublico }}
            </option>
          </select>
        </div>
      </label>
    </div>

    <p
      v-if="horarios.length === 0 && profissionalSelecionadoId"
      class="horarios-empty-list"
    >
      Nenhum horário adicionado
    </p>

    <div v-else-if="horarios.length > 0" class="horarios-prof-list-grid">
      <HorarioProfissionalListCard
        v-for="h in horarios"
        :key="h.id"
        :dia-label="diaSemanaLabel(h.diaSemana)"
        :hora-inicio="horaParaExibicao(h.horaInicio)"
        :hora-fim="horaParaExibicao(h.horaFim)"
        :ativo="h.ativo"
        :toggling="togglingId === h.id"
        :readonly="readonly || !podeGerenciar"
        @editar="emit('editar', h)"
        @ativar="emit('ativar', h)"
        @desativar="emit('desativar', h)"
      />
    </div>
  </section>
</template>
