<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  entradas: number
  saidas: number
  empty?: boolean
}>()

const chartData = computed(() => ({
  labels: ['Entradas', 'Saídas'],
  datasets: [
    {
      label: 'Valor (R$)',
      data: [props.entradas, props.saidas],
      backgroundColor: ['rgba(84, 128, 78, 0.7)', 'rgba(207, 63, 63, 0.7)'],
      borderRadius: 8,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

<template>
  <div class="financeiro-chart-card">
    <div class="financeiro-chart-card__header">
      <div>
        <p class="financeiro-kpi-card__label">Estatísticas</p>
        <p class="financeiro-chart-card__subtitle">Entradas vs saídas no período</p>
      </div>
      <div class="financeiro-chart-card__legend">
        <span class="financeiro-chart-card__legend-item">
          <span class="financeiro-chart-card__dot financeiro-chart-card__dot--entrada" />
          Entradas
        </span>
        <span class="financeiro-chart-card__legend-item">
          <span class="financeiro-chart-card__dot financeiro-chart-card__dot--saida" />
          Saídas
        </span>
      </div>
    </div>

    <div class="financeiro-chart-card__body">
      <Bar :data="chartData" :options="options" />
      <div v-if="empty" class="financeiro-chart-card__empty">
        <p class="financeiro-chart-card__empty-title">Nenhuma movimentação</p>
        <p class="financeiro-chart-card__empty-desc">
          Ainda não há entradas ou saídas neste período. Registre a primeira movimentação para acompanhar aqui.
        </p>
      </div>
    </div>
  </div>
</template>
