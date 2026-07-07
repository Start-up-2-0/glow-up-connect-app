<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import type { FluxoCaixaDia } from '@/types/negocio/caixa.types'
import { formatDate } from '@/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  dias: FluxoCaixaDia[]
}>()

const chartData = computed(() => ({
  labels: props.dias.map((d) => formatDate(d.data)),
  datasets: [
    {
      label: 'Saldo final',
      data: props.dias.map((d) => d.saldoFinalDia),
      borderColor: '#ffbf00',
      backgroundColor: 'rgba(255, 191, 0, 0.15)',
      fill: true,
      tension: 0.3,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: false } },
}
</script>

<template>
  <div class="financeiro-kpi-card h-64">
    <p class="financeiro-kpi-card__label mb-2">Fluxo de caixa</p>
    <Line :data="chartData" :options="options" />
  </div>
</template>
