<script setup lang="ts">
import { computed } from 'vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import type { ProfissionalDiaHorarioConfig } from '@/types/negocio/horario.types'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import { horaParaExibicao } from '@/constants/diasSemana'
import type { HorarioProfissionalModoConfig } from '@/types/negocio/horario.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  diaLabel: string
  lojaHorario: HorarioFuncionamento | null
  lojaAtiva: boolean
  configs: ProfissionalDiaHorarioConfig[]
  saving?: boolean
  erro?: string | null
}>()

const emit = defineEmits<{
  salvar: []
  'toggle-selecionado': [profissionalId: number]
  'toggle-todos': []
  'update-modo': [profissionalId: number, modo: HorarioProfissionalModoConfig]
  'update-horario': [profissionalId: number, field: 'horaInicio' | 'horaFim', value: string]
}>()

const lojaHorarioExibicao = computed(() => {
  if (!props.lojaHorario?.ativo) return null
  return {
    inicio: horaParaExibicao(props.lojaHorario.horaInicio),
    fim: horaParaExibicao(props.lojaHorario.horaFim),
  }
})

const totalSelecionados = computed(() => props.configs.filter((c) => c.selecionado).length)

const todosSelecionados = computed(() => {
  if (props.configs.length === 0) return false
  return props.configs.every((c) => c.selecionado)
})

function fechar() {
  if (props.saving) return
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="equipe-modal-overlay"
        role="presentation"
        @click.self="fechar"
      >
        <div
          class="equipe-modal equipe-modal--tall horarios-modal-profissionais"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'horarios-modal-title'"
        >
          <header class="equipe-modal__header">
            <div class="equipe-modal__header-top">
              <div>
                <h2 id="horarios-modal-title" class="equipe-modal__title">
                  Profissionais — {{ diaLabel }}
                </h2>
                <p class="equipe-modal__subtitle">
                  Selecione quem atende neste dia e defina se seguirá o horário da loja ou um horário
                  personalizado.
                </p>
              </div>
              <button
                type="button"
                class="equipe-modal__close-icon"
                aria-label="Fechar"
                :disabled="saving"
                @click="fechar"
              >
                <svg viewBox="0 0 16 16" fill="none" class="size-4" aria-hidden="true">
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </header>

          <div class="equipe-modal__body horarios-modal-profissionais__body">
            <ContentAlert v-if="!lojaAtiva" variant="warning">
              O horário da loja neste dia está inativo ou não configurado. Ative-o no card do dia
              para permitir que profissionais herdem o horário geral.
            </ContentAlert>

            <ContentAlert v-if="erro" variant="error" class="mb-4">
              {{ erro }}
            </ContentAlert>

            <div v-if="lojaHorarioExibicao" class="horarios-modal-profissionais__loja-ref">
              <span class="horarios-modal-profissionais__loja-ref-label">Horário da loja neste dia</span>
              <span class="horarios-modal-profissionais__loja-ref-value">
                {{ lojaHorarioExibicao.inicio }} — {{ lojaHorarioExibicao.fim }}
              </span>
            </div>

            <div class="horarios-modal-profissionais__toolbar">
              <span class="horarios-modal-profissionais__count">
                {{ totalSelecionados }} de {{ configs.length }} selecionado(s)
              </span>
              <button
                type="button"
                class="horarios-modal-profissionais__toggle-all"
                :disabled="saving || configs.length === 0"
                @click="emit('toggle-todos')"
              >
                {{ todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>

            <ul class="horarios-modal-profissionais__list">
              <li
                v-for="config in configs"
                :key="config.profissionalId"
                class="horarios-modal-profissionais__item"
                :class="{ 'horarios-modal-profissionais__item--selected': config.selecionado }"
              >
                <label class="horarios-modal-profissionais__select-row">
                  <input
                    type="checkbox"
                    class="horarios-modal-profissionais__checkbox"
                    :checked="config.selecionado"
                    :disabled="saving"
                    @change="emit('toggle-selecionado', config.profissionalId)"
                  />
                  <span class="horarios-modal-profissionais__nome">{{ config.nomePublico }}</span>
                  <span
                    v-if="config.horarioId && config.selecionado"
                    class="horarios-modal-profissionais__vinculado-badge"
                  >
                    Vinculado
                  </span>
                </label>

                <div v-if="config.selecionado" class="horarios-modal-profissionais__config">
                  <fieldset class="horarios-modal-profissionais__modo">
                    <legend class="horarios-modal-profissionais__modo-legend">Tipo de horário</legend>

                    <label class="horarios-modal-profissionais__radio">
                      <input
                        type="radio"
                        :name="`modo-${config.profissionalId}`"
                        value="loja"
                        :checked="config.modo === 'loja'"
                        :disabled="saving || !lojaAtiva"
                        @change="emit('update-modo', config.profissionalId, 'loja')"
                      />
                      <span class="horarios-modal-profissionais__radio-text">
                        Utilizar o mesmo horário da loja
                        <span
                          v-if="lojaHorarioExibicao"
                          class="horarios-modal-profissionais__radio-hint"
                        >
                          ({{ lojaHorarioExibicao.inicio }} — {{ lojaHorarioExibicao.fim }})
                        </span>
                      </span>
                    </label>

                    <label class="horarios-modal-profissionais__radio">
                      <input
                        type="radio"
                        :name="`modo-${config.profissionalId}`"
                        value="personalizado"
                        :checked="config.modo === 'personalizado'"
                        :disabled="saving"
                        @change="emit('update-modo', config.profissionalId, 'personalizado')"
                      />
                      <span class="horarios-modal-profissionais__radio-text">
                        Utilizar horário personalizado
                      </span>
                    </label>
                  </fieldset>

                  <div
                    v-if="config.modo === 'personalizado'"
                    class="horarios-modal-profissionais__horarios"
                  >
                    <div class="horario-field">
                      <span class="horario-field__label">Início</span>
                      <input
                        type="time"
                        class="horario-field__input horario-field__input--editable"
                        :value="config.horaInicio"
                        :disabled="saving"
                        required
                        @input="
                          emit(
                            'update-horario',
                            config.profissionalId,
                            'horaInicio',
                            ($event.target as HTMLInputElement).value,
                          )
                        "
                      />
                    </div>
                    <div class="horario-field">
                      <span class="horario-field__label">Fim</span>
                      <input
                        type="time"
                        class="horario-field__input horario-field__input--editable"
                        :value="config.horaFim"
                        :disabled="saving"
                        required
                        @input="
                          emit(
                            'update-horario',
                            config.profissionalId,
                            'horaFim',
                            ($event.target as HTMLInputElement).value,
                          )
                        "
                      />
                    </div>
                  </div>

                  <p
                    v-else-if="lojaHorarioExibicao"
                    class="horarios-modal-profissionais__heranca"
                  >
                    Herda automaticamente
                    {{ lojaHorarioExibicao.inicio }} — {{ lojaHorarioExibicao.fim }} da loja.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <footer class="equipe-modal__footer">
            <button
              type="button"
              class="equipe-modal__dismiss"
              :disabled="saving"
              @click="fechar"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="equipe-modal__confirm"
              :disabled="saving"
              @click="emit('salvar')"
            >
              {{ saving ? 'Salvando…' : 'Salvar vínculos' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
