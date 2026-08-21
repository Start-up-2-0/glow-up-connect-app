<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'
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
  <div class="financeiro-chart-card" :class="{ 'financeiro-chart-card--empty': empty }">
    <div class="financeiro-chart-card__header">
      <div class="financeiro-chart-card__title-row">
        <FinanceiroIcon name="grafico" class="financeiro-chart-card__title-icon" />
        <div>
          <p class="financeiro-kpi-card__label">Fluxo de caixa</p>
          <p class="financeiro-chart-card__subtitle">Entradas vs saídas no período</p>
        </div>
      </div>
      <div v-if="!empty" class="financeiro-chart-card__legend">
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

    <div v-if="empty" class="financeiro-chart-card__empty-compact">
      <p class="financeiro-chart-card__empty-title">Ainda não existem dados suficientes para gerar gráficos</p>
      <p class="financeiro-chart-card__empty-desc">
        Registre movimentações para visualizar o fluxo de caixa aqui.
      </p>
    </div>

    <div v-else class="financeiro-chart-card__body">
      <Bar :data="chartData" :options="options" />
    </div>
  </div>
</template>
