<script setup lang="ts">
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-vue-next'
import FinanceiroDashKpiCard from './FinanceiroDashKpiCard.vue'

defineProps<{
  receita: string
  despesas: string
  lucro: string
  receitaTrend?: number | null
  despesasTrend?: number | null
  lucroTrend?: number | null
  trendLabel?: string
}>()
</script>

<template>
  <section class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
    <FinanceiroDashKpiCard
      label="Receita"
      :value="receita"
      :icon="ArrowUpRight"
      icon-wrap-class="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
      :trend="receitaTrend"
      :trend-label="trendLabel"
    />
    <FinanceiroDashKpiCard
      label="Despesas"
      :value="despesas"
      :icon="ArrowDownRight"
      icon-wrap-class="bg-rose-500/12 text-rose-600 dark:text-rose-400"
      :trend="despesasTrend"
      :trend-label="trendLabel"
    />
    <FinanceiroDashKpiCard
      label="Lucro"
      :value="lucro"
      :icon="TrendingUp"
      icon-wrap-class="bg-glow-gold/15 text-glow-gold-cta"
      :trend="lucroTrend"
      :trend-label="trendLabel"
    />
  </section>
</template>
