<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import type { FinanceiroSemanaFluxo } from '@/utils/financeiroDashboard'
import { formatCurrency } from '@/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  semanas: FinanceiroSemanaFluxo[]
  empty?: boolean
}>()

const chartData = computed(() => ({
  labels: props.semanas.map((s) => s.label),
  datasets: [
    {
      label: 'Entradas',
      data: props.semanas.map((s) => s.entradas),
      backgroundColor: 'rgba(16, 185, 129, 0.75)',
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.65,
    },
    {
      label: 'Saídas',
      data: props.semanas.map((s) => s.saidas),
      backgroundColor: 'rgba(244, 63, 94, 0.7)',
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.65,
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
        label(ctx: { dataset: { label?: string }; parsed: { y: number | null } }) {
          return `${ctx.dataset.label ?? ''}: ${formatCurrency(ctx.parsed.y ?? 0)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11, family: 'Urbanist' }, color: '#61526b' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(158, 148, 170, 0.18)' },
      ticks: {
        font: { size: 11, family: 'Urbanist' },
        color: '#61526b',
        callback(value: string | number) {
          const n = Number(value)
          if (n >= 1000) return `${Math.round(n / 1000)}k`
          return String(value)
        },
      },
    },
  },
} as const
</script>

<template>
  <article
    class="rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-satoshi text-base font-bold text-glow-text">Fluxo de Caixa</h2>
        <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
          Entradas e saídas por semana no período
        </p>
      </div>
      <div v-if="!empty" class="flex items-center gap-4 font-urbanist text-xs text-glow-text-subtle">
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-emerald-500" />
          Entradas
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-rose-500" />
          Saídas
        </span>
      </div>
    </div>

    <div v-if="empty || !semanas.length" class="flex h-56 flex-col items-center justify-center px-4 text-center">
      <p class="font-satoshi text-sm font-semibold text-glow-text">
        Ainda não existem dados suficientes para gerar gráficos
      </p>
      <p class="mt-1 max-w-sm font-urbanist text-xs text-glow-text-subtle">
        Registre movimentações para visualizar o fluxo de caixa aqui.
      </p>
    </div>
    <div v-else class="h-56 sm:h-64">
      <Bar :data="chartData" :options="options" />
    </div>
  </article>
</template>
