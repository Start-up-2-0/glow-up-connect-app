<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  items: { formaPagamento: string; total: number }[]
}>()

const colors = ['#ffbf00', '#3c5ccf', '#54804e', '#a38a2d', '#cf3f3f', '#6b7280']

const chartData = computed(() => ({
  labels: props.items.map((i) => i.formaPagamento),
  datasets: [
    {
      data: props.items.map((i) => i.total),
      backgroundColor: props.items.map((_, idx) => colors[idx % colors.length]),
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}
</script>

<template>
  <div class="financeiro-kpi-card h-72">
    <p class="financeiro-kpi-card__label mb-2">Por forma de pagamento</p>
    <Doughnut v-if="items.length > 0" :data="chartData" :options="options" />
    <p v-else class="mt-8 text-center font-urbanist text-sm text-glow-text-subtle">Sem dados no período</p>
  </div>
</template>
