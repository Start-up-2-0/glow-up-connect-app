<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { DIAS_SEMANA, type DiaSemanaValue } from '@/constants/diasSemana'
import type { HorarioMassaPayload, ProfissionalHorarioOption } from '@/composables/useHorarios'
import { validarIntervaloHorario } from '@/utils/horarioProfissionalHelpers'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  saving?: boolean
  podeProfissionais?: boolean
  profissionais: ProfissionalHorarioOption[]
}>()

const emit = defineEmits<{
  aplicar: [payload: HorarioMassaPayload]
}>()

const horaInicio = ref('08:00')
const horaFim = ref('20:00')
const diasSelecionados = ref<Set<DiaSemanaValue>>(
  new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DiaSemanaValue[]),
)
const aplicarProfissionais = ref(false)
const profissionaisSelecionados = ref<Set<number>>(new Set())
const busca = ref('')
const seletorAberto = ref(false)
const erro = ref<string | null>(null)

const profissionaisFiltrados = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return props.profissionais
  return props.profissionais.filter((p) => p.nomePublico.toLowerCase().includes(q))
})

watch(open, (isOpen) => {
  if (!isOpen) return
  horaInicio.value = '08:00'
  horaFim.value = '20:00'
  diasSelecionados.value = new Set([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ] as DiaSemanaValue[])
  aplicarProfissionais.value = false
  profissionaisSelecionados.value = new Set()
  busca.value = ''
  seletorAberto.value = false
  erro.value = null
})

function toggleDia(dia: DiaSemanaValue) {
  const next = new Set(diasSelecionados.value)
  if (next.has(dia)) next.delete(dia)
  else next.add(dia)
  diasSelecionados.value = next
}

function toggleProfissional(id: number) {
  const next = new Set(profissionaisSelecionados.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  profissionaisSelecionados.value = next
}

function fechar() {
  if (props.saving) return
  open.value = false
}

function aplicar() {
  const intervaloErro = validarIntervaloHorario(horaInicio.value, horaFim.value)
  if (intervaloErro) {
    erro.value = intervaloErro
    return
  }
  if (!diasSelecionados.value.size) {
    erro.value = 'Selecione ao menos um dia.'
    return
  }
  if (aplicarProfissionais.value && !profissionaisSelecionados.value.size) {
    erro.value = 'Selecione ao menos um profissional ou desative a opção.'
    return
  }

  erro.value = null
  emit('aplicar', {
    dias: [...diasSelecionados.value],
    horaInicio: horaInicio.value,
    horaFim: horaFim.value,
    aplicarProfissionais: aplicarProfissionais.value,
    profissionalIds: [...profissionaisSelecionados.value],
  })
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
          class="equipe-modal equipe-modal--tall horarios-massa-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="horarios-massa-title"
        >
          <header class="equipe-modal__header">
            <div class="equipe-modal__header-top">
              <div>
                <h2 id="horarios-massa-title" class="equipe-modal__title">
                  Configurar horários em massa
                </h2>
                <p class="equipe-modal__subtitle">
                  Aplique o mesmo horário para vários dias.
                </p>
              </div>
              <button
                type="button"
                class="equipe-modal__close-icon"
                aria-label="Fechar"
                :disabled="saving"
                @click="fechar"
              >
                <X class="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div class="equipe-modal__body horarios-massa-modal__body">
            <ContentAlert v-if="erro" variant="error" compact>{{ erro }}</ContentAlert>

            <p class="horarios-massa-modal__warning">
              Os horários existentes dos dias selecionados serão substituídos.
            </p>

            <section class="horarios-massa-modal__section">
              <h3 class="horarios-massa-modal__section-title">Horário</h3>
              <div class="horarios-massa-modal__times">
                <label class="horario-dia-card__time-block">
                  <span class="horario-dia-card__label">Início</span>
                  <input
                    v-model="horaInicio"
                    type="time"
                    class="horario-dia-card__input"
                    :disabled="saving"
                  />
                </label>
                <label class="horario-dia-card__time-block">
                  <span class="horario-dia-card__label">Fim</span>
                  <input
                    v-model="horaFim"
                    type="time"
                    class="horario-dia-card__input"
                    :disabled="saving"
                  />
                </label>
              </div>
            </section>

            <section class="horarios-massa-modal__section">
              <h3 class="horarios-massa-modal__section-title">Aplicar em</h3>
              <div class="horarios-massa-modal__dias">
                <label
                  v-for="dia in DIAS_SEMANA"
                  :key="dia.value"
                  class="horarios-massa-modal__dia"
                >
                  <input
                    type="checkbox"
                    class="horarios-checkbox"
                    :checked="diasSelecionados.has(dia.value)"
                    :disabled="saving"
                    @change="toggleDia(dia.value)"
                  />
                  <span>{{ dia.label }}</span>
                </label>
              </div>
            </section>

            <section v-if="podeProfissionais" class="horarios-massa-modal__section">
              <label class="horario-dia-card__switch-row">
                <span class="horario-dia-card__switch-label">
                  Aplicar também os profissionais selecionados
                </span>
                <input
                  v-model="aplicarProfissionais"
                  type="checkbox"
                  class="horario-toggle"
                  :disabled="saving"
                />
              </label>

              <div v-if="aplicarProfissionais" class="mt-3 space-y-3">
                <button
                  type="button"
                  class="horario-dia-card__select-profs w-full"
                  :disabled="saving"
                  @click="seletorAberto = !seletorAberto"
                >
                  <template v-if="profissionaisSelecionados.size">
                    {{ profissionaisSelecionados.size }}
                    {{
                      profissionaisSelecionados.size === 1
                        ? 'profissional selecionado'
                        : 'profissionais selecionados'
                    }}
                  </template>
                  <template v-else>Selecionar profissionais</template>
                </button>

                <div v-if="seletorAberto" class="horarios-massa-modal__seletor">
                  <div class="horarios-massa-modal__search">
                    <Search class="size-4 text-glow-text-subtle" aria-hidden="true" />
                    <input
                      v-model="busca"
                      type="search"
                      placeholder="Buscar profissional..."
                      class="horarios-massa-modal__search-input"
                      :disabled="saving"
                    />
                  </div>
                  <ul class="horarios-massa-modal__prof-list">
                    <li v-for="prof in profissionaisFiltrados" :key="prof.profissionalId">
                      <label class="horarios-massa-modal__prof-item">
                        <input
                          type="checkbox"
                          class="horarios-checkbox"
                          :checked="profissionaisSelecionados.has(prof.profissionalId)"
                          :disabled="saving"
                          @change="toggleProfissional(prof.profissionalId)"
                        />
                        <UserAvatar :src="prof.avatarUrl" :name="prof.nomePublico" size="xs" />
                        <span>{{ prof.nomePublico }}</span>
                      </label>
                    </li>
                    <li
                      v-if="!profissionaisFiltrados.length"
                      class="px-2 py-3 text-sm text-glow-text-subtle"
                    >
                      Nenhum profissional encontrado.
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <footer class="equipe-modal__footer">
            <BaseButton variant="ghost" :disabled="saving" @click="fechar">Cancelar</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="aplicar">
              Aplicar horários
            </BaseButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
