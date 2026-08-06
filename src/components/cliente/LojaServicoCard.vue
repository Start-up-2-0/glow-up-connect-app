<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { formatPrecoFigma } from '@/utils/formatters'

const props = defineProps<{
  nome: string
  duracaoMinutos: number
  precoMinimo: number
  precoMaximo: number
  accentIndex?: number
}>()

const precoLabel = computed(() =>
  props.precoMinimo === props.precoMaximo
    ? formatPrecoFigma(props.precoMinimo)
    : `${formatPrecoFigma(props.precoMinimo)} – ${formatPrecoFigma(props.precoMaximo)}`,
)

const accentClass = computed(() => {
  const tones = [
    'loja-servico-card__icon--violet',
    'loja-servico-card__icon--rose',
    'loja-servico-card__icon--emerald',
    'loja-servico-card__icon--amber',
    'loja-servico-card__icon--sky',
  ]
  return tones[(props.accentIndex ?? 0) % tones.length]
})
</script>

<template>
  <div class="loja-servico-card">
    <div class="loja-servico-card__icon" :class="accentClass" aria-hidden="true">
      <svg class="size-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 7l3 14h6l3-14M9 7V5a3 3 0 0 1 6 0v2"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="loja-servico-card__body">
      <p class="loja-servico-card__nome">{{ nome }}</p>
      <p class="loja-servico-card__meta">{{ duracaoMinutos }} minutos</p>
    </div>
    <span class="loja-servico-card__preco">{{ precoLabel }}</span>
    <ChevronRight class="loja-servico-card__chevron" aria-hidden="true" />
  </div>
</template>
