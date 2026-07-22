<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoProfissionalRating from '@/components/servicos/ServicoProfissionalRating.vue'
import { iniciaisNome } from '@/utils/servicoFormatters'

defineProps<{
  nome: string
  notaMedia?: number | null
  totalAvaliacoes?: number | null
  selectable?: boolean
  selected?: boolean
  showRemove?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  remove: []
}>()
</script>

<template>
  <div
    class="servico-prof-vinculo-card"
    :class="{
      'servico-prof-vinculo-card--selectable': selectable,
      'servico-prof-vinculo-card--selected': selected,
    }"
    @click="selectable ? emit('toggle') : undefined"
  >
    <input
      v-if="selectable"
      type="checkbox"
      class="servico-prof-vinculo-card__checkbox"
      :checked="selected"
      tabindex="-1"
      aria-hidden="true"
      @click.prevent
    />
    <span class="servico-prof-vinculo-card__avatar">{{ iniciaisNome(nome) }}</span>
    <div class="servico-prof-vinculo-card__body">
      <p class="servico-prof-vinculo-card__name">{{ nome }}</p>
      <ServicoProfissionalRating
        :nota-media="notaMedia"
        :total-avaliacoes="totalAvaliacoes"
      />
    </div>
    <button
      v-if="showRemove"
      type="button"
      class="servico-prof-vinculo-card__remove"
      aria-label="Remover profissional"
      @click.stop="emit('remove')"
    >
      <ServicoIcons name="close" class="size-4" />
    </button>
  </div>
</template>
