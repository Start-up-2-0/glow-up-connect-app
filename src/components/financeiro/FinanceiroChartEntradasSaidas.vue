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
  <div class="financeiro-kpi-card h-64">
    <p class="financeiro-kpi-card__label mb-2">Entradas vs saídas</p>
    <Bar :data="chartData" :options="options" />
  </div>
</template>
