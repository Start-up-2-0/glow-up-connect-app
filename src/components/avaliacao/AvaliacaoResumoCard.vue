<script setup lang="ts">
import { computed } from 'vue'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'

const props = defineProps<{
  resumo: AvaliacaoResumoPublico
}>()

const maxQuantidade = computed(() =>
  Math.max(1, ...props.resumo.distribuicao.map((item) => item.quantidade)),
)

function barWidth(quantidade: number): string {
  return `${(quantidade / maxQuantidade.value) * 100}%`
}
</script>

<template>
  <div class="avaliacao-resumo-card">
    <div class="avaliacao-resumo-card__score">
      <span class="avaliacao-resumo-card__media">{{ formatNotaMediaDisplay(resumo.notaMedia) }}</span>
      <span class="avaliacao-resumo-card__meta">
        {{ resumo.totalAvaliacoes }} avaliação{{ resumo.totalAvaliacoes === 1 ? '' : 'ões' }}
        · últimos {{ resumo.janelaDias }} dias
      </span>
    </div>

    <div class="avaliacao-resumo-card__bars">
      <div
        v-for="item in [...resumo.distribuicao].reverse()"
        :key="item.nota"
        class="avaliacao-resumo-card__bar-row"
      >
        <span class="avaliacao-resumo-card__bar-label">{{ item.nota }}</span>
        <div class="avaliacao-resumo-card__bar-track">
          <div class="avaliacao-resumo-card__bar-fill" :style="{ width: barWidth(item.quantidade) }" />
        </div>
        <span class="avaliacao-resumo-card__bar-count">{{ item.quantidade }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avaliacao-resumo-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avaliacao-resumo-card__score {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.avaliacao-resumo-card__media {
  font-family: var(--font-satoshi, sans-serif);
  font-size: 2rem;
  font-weight: 700;
  color: var(--glow-gold-cta);
  line-height: 1;
}

.avaliacao-resumo-card__meta {
  font-family: var(--font-urbanist, sans-serif);
  font-size: 0.875rem;
  color: var(--glow-text-subtle);
}

.avaliacao-resumo-card__bar-row {
  display: grid;
  grid-template-columns: 1.25rem 1fr 2rem;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--glow-text-subtle);
}

.avaliacao-resumo-card__bar-track {
  height: 0.4rem;
  border-radius: 999px;
  background: var(--glow-border-soft);
  overflow: hidden;
}

.avaliacao-resumo-card__bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--glow-gold-cta);
}

.avaliacao-resumo-card__bar-count {
  text-align: right;
}
</style>
