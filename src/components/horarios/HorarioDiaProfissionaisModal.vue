<script setup lang="ts">
import { computed } from 'vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import type { ProfissionalDiaHorarioConfig } from '@/types/negocio/horario.types'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import { horaParaExibicao } from '@/constants/diasSemana'
import type { HorarioProfissionalModoConfig } from '@/types/negocio/horario.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  diaLabel: string
  lojaHorario: HorarioFuncionamento | null
  lojaAtiva: boolean
  vinculados: ProfissionalDiaHorarioConfig[]
  disponiveis: ProfissionalDiaHorarioConfig[]
  actionId?: number | null
  erro?: string | null
}>()

const emit = defineEmits<{
  fechar: []
  'update-modo': [profissionalId: number, modo: HorarioProfissionalModoConfig]
  'update-horario': [profissionalId: number, field: 'horaInicio' | 'horaFim', value: string]
  salvar: [profissionalId: number]
  vincular: [profissionalId: number]
  remover: [profissionalId: number]
}>()

const lojaHorarioExibicao = computed(() => {
  if (!props.lojaHorario?.ativo) return null
  return {
    inicio: horaParaExibicao(props.lojaHorario.horaInicio),
    fim: horaParaExibicao(props.lojaHorario.horaFim),
  }
})

function fechar() {
  if (props.actionId) return
  open.value = false
  emit('fechar')
}

function horarioExibicao(config: ProfissionalDiaHorarioConfig) {
  if (config.modo === 'loja' && lojaHorarioExibicao.value) {
    return `${lojaHorarioExibicao.value.inicio} — ${lojaHorarioExibicao.value.fim}`
  }
  return `${config.horaInicio} — ${config.horaFim}`
}

function isLoading(profissionalId: number) {
  return props.actionId === profissionalId
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
          aria-labelledby="horarios-modal-title"
        >
          <header class="equipe-modal__header">
            <div class="equipe-modal__header-top">
              <div>
                <h2 id="horarios-modal-title" class="equipe-modal__title">
                  Profissionais — {{ diaLabel }}
                </h2>
                <p class="equipe-modal__subtitle">
                  Gerencie quem atende neste dia, com horário da loja ou personalizado.
                </p>
              </div>
              <button
                type="button"
                class="equipe-modal__close-icon"
                aria-label="Fechar"
                :disabled="!!actionId"
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

            <ContentAlert v-if="erro" variant="error">
              {{ erro }}
            </ContentAlert>

            <div v-if="lojaHorarioExibicao" class="horarios-modal-profissionais__loja-ref">
              <span class="horarios-modal-profissionais__loja-ref-label">Horário da loja neste dia</span>
              <span class="horarios-modal-profissionais__loja-ref-value">
                {{ lojaHorarioExibicao.inicio }} — {{ lojaHorarioExibicao.fim }}
              </span>
            </div>

            <section v-if="vinculados.length > 0" class="horarios-modal-profissionais__section">
              <h3 class="horarios-modal-profissionais__section-title">
                Vinculados ({{ vinculados.length }})
              </h3>
              <ul class="horarios-modal-profissionais__list">
                <li
                  v-for="config in vinculados"
                  :key="config.profissionalId"
                  class="horarios-modal-profissionais__item horarios-modal-profissionais__item--selected"
                >
                  <div class="horarios-modal-profissionais__prof-header">
                    <UserAvatar
                      :src="config.avatarUrl"
                      :name="config.nomePublico"
                      size="md"
                    />
                    <div class="horarios-modal-profissionais__prof-info">
                      <span class="horarios-modal-profissionais__nome">{{ config.nomePublico }}</span>
                      <span
                        class="horarios-modal-profissionais__tipo-badge"
                        :class="
                          config.modo === 'loja'
                            ? 'horarios-modal-profissionais__tipo-badge--loja'
                            : 'horarios-modal-profissionais__tipo-badge--personalizado'
                        "
                      >
                        {{ config.modo === 'loja' ? 'Horário da loja' : 'Horário personalizado' }}
                      </span>
                      <span class="horarios-modal-profissionais__horario-resumo">
                        {{ horarioExibicao(config) }}
                      </span>
                    </div>
                  </div>

                  <div class="horarios-modal-profissionais__config">
                    <fieldset class="horarios-modal-profissionais__modo">
                      <legend class="horarios-modal-profissionais__modo-legend">Tipo de horário</legend>

                      <label class="horarios-modal-profissionais__radio">
                        <input
                          type="radio"
                          :name="`modo-${config.profissionalId}`"
                          value="loja"
                          :checked="config.modo === 'loja'"
                          :disabled="!!actionId || !lojaAtiva"
                          @change="emit('update-modo', config.profissionalId, 'loja')"
                        />
                        <span class="horarios-modal-profissionais__radio-text">
                          Utilizar o mesmo horário da loja
                        </span>
                      </label>

                      <label class="horarios-modal-profissionais__radio">
                        <input
                          type="radio"
                          :name="`modo-${config.profissionalId}`"
                          value="personalizado"
                          :checked="config.modo === 'personalizado'"
                          :disabled="!!actionId"
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
                          :disabled="!!actionId"
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
                          :disabled="!!actionId"
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
                  </div>

                  <div class="horarios-modal-profissionais__row-actions">
                    <button
                      type="button"
                      class="horarios-btn-primary horarios-btn-primary--sm"
                      :disabled="!!actionId"
                      @click="emit('salvar', config.profissionalId)"
                    >
                      {{ isLoading(config.profissionalId) ? 'Salvando…' : 'Salvar' }}
                    </button>
                    <button
                      type="button"
                      class="horarios-btn-outline horarios-btn-outline--sm horarios-modal-profissionais__remove-btn"
                      :disabled="!!actionId"
                      @click="emit('remover', config.profissionalId)"
                    >
                      {{ isLoading(config.profissionalId) ? '…' : 'Remover do dia' }}
                    </button>
                  </div>
                </li>
              </ul>
            </section>

            <section
              v-if="disponiveis.length > 0"
              class="horarios-modal-profissionais__section"
            >
              <h3 class="horarios-modal-profissionais__section-title">Adicionar profissional</h3>
              <ul class="horarios-modal-profissionais__list">
                <li
                  v-for="config in disponiveis"
                  :key="config.profissionalId"
                  class="horarios-modal-profissionais__item horarios-modal-profissionais__item--disponivel"
                >
                  <div class="horarios-modal-profissionais__prof-header">
                    <UserAvatar
                      :src="config.avatarUrl"
                      :name="config.nomePublico"
                      size="md"
                    />
                    <div class="horarios-modal-profissionais__prof-info">
                      <span class="horarios-modal-profissionais__nome">{{ config.nomePublico }}</span>
                      <span class="horarios-modal-profissionais__horario-resumo">
                        Sem vínculo neste dia
                      </span>
                    </div>
                    <button
                      type="button"
                      class="horarios-btn-outline horarios-btn-outline--sm"
                      :disabled="!!actionId"
                      @click="emit('vincular', config.profissionalId)"
                    >
                      {{ isLoading(config.profissionalId) ? 'Vinculando…' : 'Vincular' }}
                    </button>
                  </div>
                </li>
              </ul>
            </section>

            <p
              v-if="vinculados.length === 0 && disponiveis.length === 0"
              class="horarios-modal-profissionais__empty"
            >
              Nenhum profissional disponível para vincular.
            </p>
          </div>

          <footer class="equipe-modal__footer">
            <button
              type="button"
              class="equipe-modal__dismiss"
              :disabled="!!actionId"
              @click="fechar"
            >
              Fechar
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
