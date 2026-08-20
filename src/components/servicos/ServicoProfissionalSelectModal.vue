<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoProfissionalRating from '@/components/servicos/ServicoProfissionalRating.vue'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { iniciaisNome } from '@/utils/servicoFormatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  profissionais: ProfissionalEquipe[]
  selectedIds: number[]
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  confirm: [ids: number[]]
}>()

const draftIds = ref<number[]>([])

const selecionadosCount = computed(() => draftIds.value.length)
const todosSelecionados = computed(
  () =>
    props.profissionais.length > 0 &&
    draftIds.value.length === props.profissionais.length,
)

watch(open, (isOpen) => {
  if (isOpen) {
    draftIds.value = [...props.selectedIds]
  }
})

function close() {
  open.value = false
}

function toggle(id: number) {
  if (draftIds.value.includes(id)) {
    draftIds.value = draftIds.value.filter((item) => item !== id)
    return
  }
  draftIds.value = [...draftIds.value, id]
}

function toggleTodos() {
  if (todosSelecionados.value) {
    draftIds.value = []
    return
  }
  draftIds.value = props.profissionais.map((p) => p.profissionalId)
}

function confirmar() {
  emit('confirm', [...draftIds.value])
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="equipe-modal-overlay"
        role="presentation"
        @click.self="close"
      >
        <div
          class="servicos-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="servico-prof-modal-title"
        >
          <div class="servicos-modal__header">
            <div class="servicos-modal__header-top">
              <h2 id="servico-prof-modal-title" class="servicos-modal__title">
                {{ title ?? 'Selecionar profissionais' }}
              </h2>
              <button
                type="button"
                class="servicos-modal__close-icon"
                aria-label="Fechar"
                @click="close"
              >
                <ServicoIcons name="close" />
              </button>
            </div>
            <p class="servicos-modal__subtitle">
              {{ subtitle ?? 'Escolha quem poderá executar este serviço.' }}
            </p>
          </div>

          <div class="servicos-modal__toolbar">
            <button type="button" class="servicos-prof-select-all" @click="toggleTodos">
              <input
                type="checkbox"
                class="servico-prof-vinculo-card__checkbox"
                :checked="todosSelecionados"
                tabindex="-1"
                aria-hidden="true"
                @click.prevent
              />
              Selecionar todos
            </button>
            <span class="servicos-modal__count">
              {{ selecionadosCount }} de {{ profissionais.length }}
            </span>
          </div>

          <div class="servicos-modal__list">
            <button
              v-for="prof in profissionais"
              :key="prof.profissionalId"
              type="button"
              class="servicos-modal__option"
              @click="toggle(prof.profissionalId)"
            >
              <input
                type="checkbox"
                class="servico-prof-vinculo-card__checkbox"
                :checked="draftIds.includes(prof.profissionalId)"
                tabindex="-1"
                aria-hidden="true"
                @click.prevent
              />
              <span class="servico-prof-vinculo-card__avatar">
                {{ iniciaisNome(prof.nomePublico) }}
              </span>
              <div class="servicos-modal__option-info">
                <span class="servico-prof-vinculo-card__name">{{ prof.nomePublico }}</span>
                <ServicoProfissionalRating
                  :nota-media="prof.notaMedia"
                  :total-avaliacoes="prof.totalAvaliacoes"
                />
              </div>
            </button>
          </div>

          <div class="servicos-modal__footer">
            <button type="button" class="servicos-modal__dismiss" @click="close">
              Fechar
            </button>
            <button type="button" class="servicos-modal__confirm" @click="confirmar">
              Concluir escolha
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
