<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import type { ReceitaDia } from '@/utils/dashboardNegocioUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  data: ReceitaDia[]
  loading?: boolean
}>()

const empty = computed(() => props.data.every((d) => d.value === 0))

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.value),
      borderColor: 'rgba(84, 128, 78, 0.9)',
      backgroundColor: 'rgba(84, 128, 78, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 6, color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
    },
  },
}
</script>

<template>
  <section class="dashboard-chart-card">
    <div class="dashboard-chart-card__header">
      <div class="dashboard-chart-card__title-row">
        <span class="dashboard-chart-card__icon-wrap dashboard-chart-card__icon-wrap--green">
          <DashboardIcon name="chart" class="dashboard-chart-card__icon" />
        </span>
        <div>
          <h2 class="dashboard-chart-card__title">Receita últimos 30 dias</h2>
          <p class="dashboard-chart-card__subtitle">Entradas registradas no período</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="dashboard-chart-card__empty">Carregando gráfico...</div>
    <div v-else-if="empty" class="dashboard-chart-card__empty">
      <p class="dashboard-chart-card__empty-title">Sem receita registrada ainda</p>
      <p class="dashboard-chart-card__empty-desc">
        Quando houver movimentações financeiras, a evolução aparecerá aqui.
      </p>
    </div>
    <div v-else class="dashboard-chart-card__body">
      <Line :data="chartData" :options="options" />
    </div>
  </section>
</template>
