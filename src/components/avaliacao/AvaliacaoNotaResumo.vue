<script setup lang="ts">
import { computed } from 'vue'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'

const props = withDefaults(
  defineProps<{
    notaMedia: number
    totalAvaliacoes: number
    variant?: 'inline' | 'stacked'
  }>(),
  {
    variant: 'inline',
  },
)

const visivel = computed(() => props.notaMedia > 0 && props.totalAvaliacoes > 0)

const notaFormatada = computed(() => formatNotaMediaDisplay(props.notaMedia))

const contagemLabel = computed(() => {
  const n = props.totalAvaliacoes
  const texto = n === 1 ? 'avaliação' : 'avaliações'
  return props.variant === 'inline' ? `(${n} ${texto})` : `${n} ${texto}`
})
</script>

<template>
  <div
    v-if="visivel"
    class="avaliacao-nota-resumo"
    :class="`avaliacao-nota-resumo--${variant}`"
    :aria-label="`Nota média ${notaFormatada} com ${totalAvaliacoes} avaliações`"
  >
    <div class="avaliacao-nota-resumo__score">
      <svg class="avaliacao-nota-resumo__star" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
          fill="currentColor"
        />
      </svg>
      <span class="avaliacao-nota-resumo__value">{{ notaFormatada }}</span>
    </div>
    <span class="avaliacao-nota-resumo__count">{{ contagemLabel }}</span>
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

.avaliacao-nota-resumo--stacked {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.avaliacao-nota-resumo--stacked .avaliacao-nota-resumo__score {
  display: inline-flex;
  height: 1.375rem;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.25rem;
  background: var(--glow-hover-surface, rgba(40, 40, 40, 0.04));
  padding: 0 0.75rem;
  font-family: var(--font-urbanist, sans-serif);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  color: var(--glow-text, #282828);
}

.avaliacao-nota-resumo--stacked .avaliacao-nota-resumo__count {
  margin-top: 0.25rem;
  font-family: var(--font-urbanist, sans-serif);
  font-size: 0.75rem;
  line-height: 1;
  color: var(--glow-text, #282828);
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
