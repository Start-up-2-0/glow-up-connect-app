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
  if (props.variant === 'inline') return `(${n} ${texto})`
  return `${n} ${texto}`
})

const variantClass = computed(() => {
  if (props.variant === 'panel' || props.variant === 'stacked') {
    return 'cliente-loja-rating-panel'
  }
  return 'avaliacao-nota-resumo--inline'
})
</script>

<template>
  <div
    class="avaliacao-nota-resumo"
    :class="variantClass"
    :aria-label="`Nota média ${notaFormatada} com ${totalAvaliacoesExibicao} avaliações`"
  >
    <div :class="variant === 'panel' || variant === 'stacked' ? 'cliente-loja-rating-panel__score' : 'avaliacao-nota-resumo__score'">
      <svg
        :class="variant === 'panel' || variant === 'stacked' ? 'cliente-loja-rating-panel__star' : 'avaliacao-nota-resumo__star'"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
          fill="currentColor"
        />
      </svg>
      <span :class="variant === 'panel' || variant === 'stacked' ? 'cliente-loja-rating-panel__value' : 'avaliacao-nota-resumo__value'">{{ notaFormatada }}</span>
    </div>
    <p :class="variant === 'panel' || variant === 'stacked' ? 'cliente-loja-rating-panel__count' : 'avaliacao-nota-resumo__count'">{{ contagemLabel }}</p>
  </div>
</template>

<style scoped>
.avaliacao-nota-resumo {
  --avaliacao-nota-star-size: 1rem;
}

.avaliacao-nota-resumo--inline {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-urbanist, sans-serif);
  font-size: 0.75rem;
  line-height: 1;
  color: var(--glow-text-subtle, #6b7280);
}

.avaliacao-nota-resumo--inline .avaliacao-nota-resumo__score {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.avaliacao-nota-resumo--inline .avaliacao-nota-resumo__count {
  color: inherit;
}

.avaliacao-nota-resumo__star {
  width: var(--avaliacao-nota-star-size);
  height: var(--avaliacao-nota-star-size);
  flex-shrink: 0;
  color: var(--glow-gold-cta, #d4a017);
}

.avaliacao-nota-resumo__value {
  font-weight: 700;
  color: var(--glow-text, #282828);
}
</style>
