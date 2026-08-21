<script setup lang="ts">
import { computed } from 'vue'
import { AGENDAR_CARD_CLASS, AGENDAR_PRICE_PILL_CLASS } from '@/constants/designTokens'
import ServicoImagem from '@/components/servicos/ServicoImagem.vue'
import { formatPrecoRange } from '@/utils/formatters'

const props = defineProps<{
  nome: string
  descricao?: string
  duracaoMinutos: number
  precoMinimo: number
  precoMaximo: number
  imagem?: string | null
  tipoServico?: 'Individual' | 'Combo'
  selected: boolean
  disabled?: boolean
  motivoBloqueio?: string
}>()

const emit = defineEmits<{
  toggle: []
}>()

const isCombo = computed(() => props.tipoServico === 'Combo')

function handleClick() {
  if (props.disabled) return
  emit('toggle')
}
</script>

<template>
  <button
    type="button"
    :class="[
      AGENDAR_CARD_CLASS,
      'agendar-servico-card flex w-full items-start gap-4 p-4 text-left sm:px-5',
      selected ? 'agendar-servico-card--selected' : '',
      disabled ? 'agendar-servico-card--disabled opacity-50 cursor-not-allowed' : '',
    ]"
    :aria-pressed="selected"
    :disabled="disabled"
    :title="disabled ? motivoBloqueio : undefined"
    @click="handleClick"
  >
    <ServicoImagem :imagem="imagem" :alt="nome" size="md" />
    <span
      class="agendar-servico-card__radio"
      :class="selected ? 'agendar-servico-card__radio--selected' : ''"
      aria-hidden="true"
    >
      <span v-if="selected" class="agendar-servico-card__radio-dot" />
    </span>
    <div class="min-w-0 flex-1 pr-2">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-urbanist text-base font-semibold text-glow-text">{{ nome }}</p>
        <span
          v-if="isCombo"
          class="rounded-full bg-glow-gold/15 px-2 py-0.5 font-urbanist text-[10px] font-semibold uppercase tracking-wide text-glow-gold-dark"
        >
          Combo
        </span>
      </div>
      <p v-if="descricao" class="mt-0.5 font-urbanist text-sm text-glow-text-subtle">
        {{ descricao }}
      </p>
      <p v-if="disabled && motivoBloqueio" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
        {{ motivoBloqueio }}
      </p>
      <p class="mt-2 flex items-center gap-1 font-urbanist text-xs text-glow-text-subtle">
        <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
          <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
        {{ duracaoMinutos }} minutos
      </p>
    </div>
    <span :class="AGENDAR_PRICE_PILL_CLASS">
      {{ formatPrecoRange(precoMinimo, precoMaximo) }}
    </span>
  </button>
</template>
