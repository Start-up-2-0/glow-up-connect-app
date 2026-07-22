<script setup lang="ts">
import { computed } from 'vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import type { MovimentoFinanceiro } from '@/types/negocio/financeiro.types'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps<{
  itens: MovimentoFinanceiro[]
  loading?: boolean
}>()

defineEmits<{
  verTodas: []
}>()

const vazio = computed(() => !props.loading && props.itens.length === 0)
</script>

<template>
  <section class="financeiro-recent">
    <div class="financeiro-recent__header">
      <div>
        <h2 class="financeiro-recent__title">Últimas movimentações</h2>
        <p class="financeiro-recent__subtitle">Atividades recentes do período selecionado</p>
      </div>
      <button type="button" class="financeiro-recent__link" @click="$emit('verTodas')">
        Ver todas →
      </button>
    </div>

    <FinanceiroEmptyState
      v-if="vazio"
      title="Nenhum lançamento encontrado"
      description="As movimentações registradas aparecerão aqui para consulta rápida."
    />

    <div v-else class="financeiro-recent__list">
      <div
        v-for="item in itens"
        :key="item.id"
        class="financeiro-recent__row"
      >
        <div class="financeiro-recent__meta">
          <span class="financeiro-recent__date">{{ formatDate(item.data) }}</span>
          <span class="financeiro-recent__desc">{{ item.descricao }}</span>
        </div>
        <span
          class="financeiro-recent__valor"
          :class="item.direcao === 'entrada' ? 'financeiro-recent__valor--entrada' : 'financeiro-recent__valor--saida'"
        >
          {{ item.direcao === 'entrada' ? '+' : '−' }}{{ formatCurrency(item.valor) }}
        </span>
      </div>
    </div>
  </section>
</template>
