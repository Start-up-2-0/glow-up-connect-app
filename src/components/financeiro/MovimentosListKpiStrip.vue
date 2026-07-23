<script setup lang="ts">
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroTrendBadge from '@/components/financeiro/FinanceiroTrendBadge.vue'

defineProps<{
  recebidoHoje: string
  recebidoPeriodo: string
  totalRegistros: string
  ticketMedio: string
  periodoTrend?: number | null
  loading?: boolean
}>()
</script>

<template>
  <section class="financeiro-movimentos-kpis" aria-label="Resumo financeiro">
    <FinanceiroKpiCard
      label="Recebido hoje"
      :value="loading ? '—' : recebidoHoje"
      accent="green"
      variant="positive"
    />
    <div class="financeiro-movimentos-kpis__item">
      <FinanceiroKpiCard
        label="Recebido no período"
        :value="loading ? '—' : recebidoPeriodo"
        accent="gold"
      />
      <FinanceiroTrendBadge
        v-if="periodoTrend != null && !loading"
        :value="periodoTrend"
        label="vs período anterior"
        class="mt-1"
      />
    </div>
    <FinanceiroKpiCard
      label="Total de registros"
      :value="loading ? '—' : totalRegistros"
      accent="blue"
    />
    <FinanceiroKpiCard
      label="Ticket médio"
      :value="loading ? '—' : ticketMedio"
      accent="neutral"
    />
  </section>
</template>
