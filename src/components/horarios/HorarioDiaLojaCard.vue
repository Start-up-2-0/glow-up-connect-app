<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Clock3, Pencil, Plus, Users } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import HorarioStatusBadge from '@/components/horarios/HorarioStatusBadge.vue'
import type { DiaLojaDraft, DiaLojaModo, ProfissionalHorarioOption } from '@/composables/useHorarios'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import type { DiaSemanaValue } from '@/constants/diasSemana'
import { horaParaExibicao } from '@/constants/diasSemana'
import { validarIntervaloHorario } from '@/utils/horarioProfissionalHelpers'

const props = withDefaults(
  defineProps<{
    dia: DiaSemanaValue
    label: string
    horario: HorarioFuncionamento | null
    modo: DiaLojaModo
    draft: DiaLojaDraft
    saving?: boolean
    readonly?: boolean
    profissionais?: ProfissionalHorarioOption[]
    exibeProfissionais?: boolean
    compactMobile?: boolean
  }>(),
  {
    saving: false,
    readonly: false,
    profissionais: () => [],
    exibeProfissionais: false,
    compactMobile: false,
  },
)

const emit = defineEmits<{
  'update:draft': [value: DiaLojaDraft]
  salvar: [ativo: boolean]
  ativar: []
  desativar: []
  editar: []
  cancelar: []
  profissionais: []
}>()

const aberto = ref(true)
const fieldError = ref<string | null>(null)

/** Só o modo edição explícito — 'novo' fica em leitura (fechado). */
const isEditing = computed(() => !props.readonly && props.modo === 'edicao')
const isAtivo = computed(() => props.horario?.ativo === true)
const isFechado = computed(() => !isAtivo.value)

const horaInicioExibida = computed(() => {
  if (!props.horario?.horaInicio) return null
  return horaParaExibicao(props.horario.horaInicio)
})
const horaFimExibida = computed(() => {
  if (!props.horario?.horaFim) return null
  return horaParaExibicao(props.horario.horaFim)
})

const qtdProfissionais = computed(() => props.profissionais.length)

const profissionaisLabel = computed(() => {
  const n = qtdProfissionais.value
  if (n === 0) return 'Nenhum profissional'
  if (n === 1) return '1 profissional'
  return `${n} profissionais`
})

watch(
  () => props.modo,
  (modo) => {
    if (modo === 'edicao') {
      aberto.value = true
      fieldError.value = null
    }
  },
)

function updateDraft(field: keyof DiaLojaDraft, value: string) {
  fieldError.value = null
  emit('update:draft', { ...props.draft, [field]: value })
}

function onSalvar() {
  if (aberto.value) {
    const erro = validarIntervaloHorario(props.draft.horaInicio, props.draft.horaFim)
    if (erro) {
      fieldError.value = erro
      return
    }
  }
  emit('salvar', aberto.value)
}
</script>

<template>
  <article
    class="horario-dia-card"
    :class="{
      'horario-dia-card--editando': isEditing,
      'horario-dia-card--fechado': !isEditing && isFechado,
      'horario-dia-card--compact': compactMobile && !isEditing,
    }"
  >
    <!-- Mobile compacto -->
    <template v-if="compactMobile && !isEditing">
      <div class="horario-dia-card__compact-row">
        <div class="min-w-0 flex-1">
          <div class="horario-dia-card__header">
            <h3 class="horario-dia-card__title">{{ label }}</h3>
            <HorarioStatusBadge :ativo="isAtivo" />
          </div>
          <p v-if="isAtivo && horaInicioExibida && horaFimExibida" class="horario-dia-card__range">
            {{ horaInicioExibida }} — {{ horaFimExibida }}
          </p>
          <p v-else class="horario-dia-card__closed-label">Loja fechada</p>
          <p v-if="exibeProfissionais" class="horario-dia-card__profs-count mt-1.5">
            {{ profissionaisLabel }}
          </p>
        </div>
        <button
          v-if="!readonly"
          type="button"
          class="horario-dia-card__edit-link"
          @click="emit('editar')"
        >
          {{ isFechado ? 'Definir' : 'Editar' }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="horario-dia-card__header">
        <h3 class="horario-dia-card__title">{{ label }}</h3>
        <HorarioStatusBadge v-if="!isEditing" :ativo="isAtivo" />
      </div>

      <!-- Leitura: ativo -->
      <template v-if="!isEditing && isAtivo">
        <div class="horario-dia-card__times-read">
          <div class="horario-dia-card__time-block">
            <span class="horario-dia-card__label">Início</span>
            <div class="horario-dia-card__time-box">
              <span class="horario-dia-card__time-text">{{ horaInicioExibida }}</span>
              <Clock3 class="horario-dia-card__time-box-icon" aria-hidden="true" />
            </div>
          </div>
          <div class="horario-dia-card__time-block">
            <span class="horario-dia-card__label">Fim</span>
            <div class="horario-dia-card__time-box">
              <span class="horario-dia-card__time-text">{{ horaFimExibida }}</span>
              <Clock3 class="horario-dia-card__time-box-icon" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div v-if="exibeProfissionais" class="horario-dia-card__profs">
          <span class="horario-dia-card__label">Profissionais</span>
          <button
            v-if="qtdProfissionais > 0"
            type="button"
            class="horario-dia-card__profs-count-btn"
            @click="emit('profissionais')"
          >
            <Users class="size-3.5 shrink-0" aria-hidden="true" />
            <span>{{ profissionaisLabel }}</span>
          </button>
          <template v-else>
            <p class="horario-dia-card__profs-empty">Nenhum profissional vinculado</p>
            <button type="button" class="horario-dia-card__add-prof" @click="emit('profissionais')">
              <Plus class="size-3.5" aria-hidden="true" />
              Adicionar
            </button>
          </template>
        </div>

        <button
          v-if="!readonly"
          type="button"
          class="horario-dia-card__edit-btn"
          data-tour="horario-edit-day"
          @click="emit('editar')"
        >
          <Pencil class="size-3.5" aria-hidden="true" />
          Editar dia
        </button>
      </template>

      <!-- Leitura: fechado / sem horário -->
      <template v-else-if="!isEditing">
        <div class="horario-dia-card__closed">
          <p class="horario-dia-card__closed-label">Loja fechada</p>
          <p class="horario-dia-card__closed-range" aria-hidden="true">— : — às — : —</p>
        </div>

        <button
          v-if="!readonly"
          type="button"
          class="horario-dia-card__define-btn"
          data-tour="horario-edit-day"
          @click="emit('editar')"
        >
          <Plus class="size-3.5" aria-hidden="true" />
          Definir horário
        </button>

        <button
          v-if="exibeProfissionais"
          type="button"
          class="horario-dia-card__profs-btn"
          @click="emit('profissionais')"
        >
          <Users class="size-3.5" aria-hidden="true" />
          Profissionais ({{ profissionais.length }})
        </button>
      </template>

      <!-- Edição (um dia por vez) -->
      <template v-else>
        <label class="horario-dia-card__switch-row">
          <span class="horario-dia-card__switch-label">Loja aberta neste dia</span>
          <input v-model="aberto" type="checkbox" class="horario-toggle" />
        </label>
        <p v-if="!aberto" class="horario-dia-card__closed-hint">Loja fechada neste dia.</p>

        <div class="horario-dia-card__times-edit" data-tour="horario-times" :class="{ 'is-disabled': !aberto }">
          <label class="horario-dia-card__time-block">
            <span class="horario-dia-card__label">Início</span>
            <input
              type="time"
              class="horario-dia-card__input"
              :value="draft.horaInicio"
              :disabled="!aberto || saving"
              required
              @input="updateDraft('horaInicio', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="horario-dia-card__time-block">
            <span class="horario-dia-card__label">Fim</span>
            <input
              type="time"
              class="horario-dia-card__input"
              :value="draft.horaFim"
              :disabled="!aberto || saving"
              required
              @input="updateDraft('horaFim', ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <p v-if="fieldError" class="horario-dia-card__error">{{ fieldError }}</p>

        <div v-if="exibeProfissionais" class="horario-dia-card__profs" data-tour="horario-profissionais" :class="{ 'is-disabled': !aberto }">
          <span class="horario-dia-card__label">Profissionais</span>
          <button
            type="button"
            class="horario-dia-card__select-profs"
            :disabled="!aberto || saving"
            @click="emit('profissionais')"
          >
            <Users class="size-3.5" aria-hidden="true" />
            {{ qtdProfissionais > 0 ? profissionaisLabel : 'Selecionar profissionais' }}
          </button>
        </div>

        <div class="horario-dia-card__actions">
          <BaseButton variant="ghost" size="sm" :disabled="saving" @click="emit('cancelar')">
            Cancelar
          </BaseButton>
          <span data-tour="horario-save" class="inline-flex">
            <BaseButton variant="primary" size="sm" :loading="saving" @click="onSalvar">
              Salvar
            </BaseButton>
          </span>
        </div>
      </template>
    </template>
  </article>
</template>
