<script setup lang="ts">
defineProps<{
  totalValor: string
  formasPagamento: Array<{ label: string; total: number; pct: number }>
  ultimaAtualizacao?: string
  isEntrada?: boolean
}>()
</script>

<template>
  <aside class="financeiro-movimentos-summary" aria-label="Resumo da listagem">
    <h3 class="financeiro-movimentos-summary__title">Resumo</h3>

    <div class="financeiro-movimentos-summary__block">
      <p class="financeiro-movimentos-summary__label">{{ isEntrada ? 'Entradas na página' : 'Saídas na página' }}</p>
      <p class="financeiro-movimentos-summary__value financeiro-movimentos-summary__value--positive">{{ totalValor }}</p>
    </div>

    <div v-if="formasPagamento.length" class="financeiro-movimentos-summary__block">
      <p class="financeiro-movimentos-summary__label">Formas de pagamento</p>
      <ul class="financeiro-movimentos-summary__list">
        <li v-for="item in formasPagamento" :key="item.label" class="financeiro-movimentos-summary__list-item">
          <span>{{ item.label }}</span>
          <span class="financeiro-movimentos-summary__pct">{{ item.pct }}%</span>
        </li>
      </ul>
    </div>

    <p v-if="ultimaAtualizacao" class="financeiro-movimentos-summary__updated">
      Última atualização · {{ ultimaAtualizacao }}
    </p>
  </aside>
</template>
