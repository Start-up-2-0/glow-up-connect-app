<script setup lang="ts">
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'
import FinanceiroTrendBadge from '@/components/financeiro/FinanceiroTrendBadge.vue'

defineProps<{
  saldo: string
  entradas: string
  saidas: string
  lucro: string
  lucroPositivo: boolean
  lucroTrend?: number | null
  entradasTrend?: number | null
  saidasTrend?: number | null
  trendLabel?: string
}>()
</script>

<template>
  <section class="financeiro-dashboard-hero">
    <div class="financeiro-dashboard-hero__main">
      <div class="financeiro-dashboard-hero__saldo-block">
        <div class="financeiro-dashboard-hero__label-row">
          <FinanceiroIcon name="saldo" class="financeiro-dashboard-hero__icon" />
          <p class="financeiro-dashboard-hero__label">Saldo atual</p>
        </div>
        <p class="financeiro-dashboard-hero__value">{{ saldo }}</p>
        <FinanceiroTrendBadge
          v-if="lucroTrend != null"
          :value="lucroTrend"
          :label="trendLabel ?? 'vs período anterior'"
        />
        <p
          v-else
          class="financeiro-dashboard-hero__lucro-hint"
          :class="lucroPositivo ? 'financeiro-dashboard-hero__lucro-hint--positive' : 'financeiro-dashboard-hero__lucro-hint--negative'"
        >
          Lucro do período: {{ lucro }}
        </p>
      </div>

      <div class="financeiro-dashboard-hero__side">
        <div class="financeiro-dashboard-hero__mini">
          <div class="financeiro-dashboard-hero__mini-head">
            <FinanceiroIcon name="entrada" class="financeiro-dashboard-hero__mini-icon financeiro-dashboard-hero__mini-icon--entrada" />
            <span>Entradas</span>
          </div>
          <p class="financeiro-dashboard-hero__mini-value financeiro-dashboard-hero__mini-value--entrada">{{ entradas }}</p>
          <FinanceiroTrendBadge :value="entradasTrend" label="vs período anterior" />
        </div>
        <div class="financeiro-dashboard-hero__mini">
          <div class="financeiro-dashboard-hero__mini-head">
            <FinanceiroIcon name="saida" class="financeiro-dashboard-hero__mini-icon financeiro-dashboard-hero__mini-icon--saida" />
            <span>Saídas</span>
          </div>
          <p class="financeiro-dashboard-hero__mini-value financeiro-dashboard-hero__mini-value--saida">{{ saidas }}</p>
          <FinanceiroTrendBadge :value="saidasTrend" label="vs período anterior" />
        </div>
      </div>
    </div>
  </section>
</template>
