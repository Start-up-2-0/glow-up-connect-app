<script setup lang="ts">
import { computed } from 'vue'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'

const props = withDefaults(
  defineProps<{
    notaMedia?: number | null
    totalAvaliacoes?: number | null
    variant?: 'inline' | 'stacked' | 'panel'
  }>(),
  {
    notaMedia: 0,
    totalAvaliacoes: 0,
    variant: 'inline',
  },
)

const notaFormatada = computed(() => formatNotaMediaDisplay(props.notaMedia))

const totalAvaliacoesExibicao = computed(() => Math.max(0, props.totalAvaliacoes ?? 0))

const contagemLabel = computed(() => {
  const n = totalAvaliacoesExibicao.value
  const texto = n === 1 ? 'avaliação' : 'avaliações'
  if (props.variant === 'inline') return `  (${n} ${texto})`
  return `${n} ${texto}`
})
</script>

<template>
  <div
    v-if="variant === 'inline'"
    class="avaliacao-nota-resumo avaliacao-nota-resumo--inline"
    :aria-label="`Nota média ${notaFormatada} com ${totalAvaliacoesExibicao} avaliações`"
  >
    <svg class="avaliacao-nota-resumo__star" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
        fill="currentColor"
      />
    </svg>
    <span class="avaliacao-nota-resumo__text">
      <span class="avaliacao-nota-resumo__value">{{ notaFormatada }}</span>
      <span class="avaliacao-nota-resumo__count">{{ contagemLabel }}</span>
    </span>
  </div>

  <div
    v-else
    class="avaliacao-nota-resumo cliente-loja-rating-panel"
    :aria-label="`Nota média ${notaFormatada} com ${totalAvaliacoesExibicao} avaliações`"
  >
    <div class="cliente-loja-rating-panel__score">
      <svg class="cliente-loja-rating-panel__star" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
          fill="currentColor"
        />
      </svg>
      <span class="cliente-loja-rating-panel__value">{{ notaFormatada }}</span>
    </div>
    <p class="cliente-loja-rating-panel__count">{{ contagemLabel }}</p>
  </div>
</template>

<style scoped>
.avaliacao-nota-resumo {
  --avaliacao-nota-star-size: 1rem;
}

.avaliacao-nota-resumo--inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-urbanist, sans-serif);
  font-size: 12px;
  line-height: normal;
}

.avaliacao-nota-resumo--inline .avaliacao-nota-resumo__text {
  display: inline;
  white-space: nowrap;
}

.avaliacao-nota-resumo--inline .avaliacao-nota-resumo__count {
  color: rgba(40, 40, 40, 0.6);
  font-weight: 400;
}

.avaliacao-nota-resumo__star {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--glow-gold-cta);
}

.avaliacao-nota-resumo__value {
  font-weight: 700;
  color: var(--glow-text);
}
</style>
