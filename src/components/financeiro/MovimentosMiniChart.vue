<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ReceitaDia } from '@/utils/dashboardNegocioUtils'
import { formatCurrency } from '@/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps<{
  dados: ReceitaDia[]
  titulo?: string
  empty?: boolean
}>()

const chartData = computed(() => ({
  labels: props.dados.map((d) => d.label),
  datasets: [
    {
      label: 'Receitas',
      data: props.dados.map((d) => d.value),
      borderColor: 'rgba(84, 128, 78, 0.9)',
      backgroundColor: 'rgba(84, 128, 78, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 4,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label(ctx: { parsed: { y: number | null } }) {
          return formatCurrency(ctx.parsed.y ?? 0)
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 8, font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      ticks: { maxTicksLimit: 4, font: { size: 10 } },
    },
  },
} as const

const totalPeriodo = computed(() => props.dados.reduce((acc, d) => acc + d.value, 0))
</script>

<template>
  <div class="financeiro-movimentos-chart">
    <div class="financeiro-movimentos-chart__header">
      <div>
        <h3 class="financeiro-movimentos-chart__title">{{ titulo ?? 'Receitas nos últimos 30 dias' }}</h3>
        <p v-if="!empty" class="financeiro-movimentos-chart__subtitle">
          Total {{ formatCurrency(totalPeriodo) }}
        </p>
      </div>
    </div>
    <div v-if="empty" class="financeiro-chart-card__empty-compact">
      <p class="financeiro-chart-card__empty-title">Sem dados no período</p>
      <p class="financeiro-chart-card__empty-desc">Registre entradas para visualizar a tendência.</p>
    </div>
    <div v-else class="financeiro-movimentos-chart__body">
      <Line :data="chartData" :options="options" />
    </div>
  </div>
</template>
