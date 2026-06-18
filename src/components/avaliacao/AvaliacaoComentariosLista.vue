<script setup lang="ts">
import type { AvaliacaoComentarioItem } from '@/types/avaliacao.types'
import { formatAgendaDateTime } from '@/utils/formatters'

defineProps<{
  itens: AvaliacaoComentarioItem[]
}>()
</script>

<template>
  <ul class="avaliacao-comentarios-lista">
    <li v-for="(item, index) in itens" :key="`${item.avaliadoEm}-${index}`" class="avaliacao-comentarios-lista__item">
      <div class="avaliacao-comentarios-lista__header">
        <span class="avaliacao-comentarios-lista__nota">{{ item.nota }}/5</span>
        <span class="avaliacao-comentarios-lista__meta">
          {{ item.clienteNome }} · {{ formatAgendaDateTime(item.avaliadoEm) }}
        </span>
      </div>
      <p v-if="item.comentario" class="avaliacao-comentarios-lista__texto">{{ item.comentario }}</p>
    </li>
  </ul>
</template>

<style scoped>
.avaliacao-comentarios-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.avaliacao-comentarios-lista__item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--glow-border-soft, #e5e7eb);
}

.avaliacao-comentarios-lista__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.avaliacao-comentarios-lista__nota {
  font-weight: 700;
  color: var(--glow-gold-cta, #d4a017);
}

.avaliacao-comentarios-lista__meta {
  font-size: 0.8rem;
  color: var(--glow-text-subtle, #6b7280);
}

.avaliacao-comentarios-lista__texto {
  margin: 0;
  font-size: 0.9rem;
  color: var(--glow-text, #111827);
  line-height: 1.45;
}
</style>
