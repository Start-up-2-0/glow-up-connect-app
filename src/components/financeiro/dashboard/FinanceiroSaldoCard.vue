<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import FinanceiroTrendBadge from '@/components/financeiro/FinanceiroTrendBadge.vue'
import type { FinanceiroSeriePonto } from '@/utils/financeiroDashboard'
import { formatCurrency } from '@/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  saldo: string
  serie: FinanceiroSeriePonto[]
  trend?: number | null
  empty?: boolean
}>()

const chartData = computed(() => ({
  labels: props.serie.map((p) => p.label),
  datasets: [
    {
      data: props.serie.map((p) => p.value),
      borderColor: 'rgba(146, 103, 155, 0.95)',
      backgroundColor: 'rgba(146, 103, 155, 0.12)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: '#92679b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    },
  ],
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        title: () => '',
        label(ctx: { parsed: { y: number | null }; label: string }) {
          return `${formatCurrency(ctx.parsed.y ?? 0)} ${ctx.label || ''}`.trim()
        },
      },
    },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  interaction: { mode: 'nearest' as const, intersect: false },
}))
</script>

<template>
  <article
    class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="relative z-10 flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-1.5">
          <p class="font-urbanist text-sm font-medium text-glow-text-subtle">Saldo atual</p>
          <Info class="size-3.5 text-glow-text-subtle/70" aria-hidden="true" />
        </div>
        <p class="mt-2 font-satoshi text-3xl font-bold tracking-tight text-glow-text sm:text-4xl">
          {{ saldo }}
        </p>
        <FinanceiroTrendBadge v-if="trend != null" class="mt-2" :value="trend" />
      </div>
    </div>

    <div v-if="!empty && serie.length" class="mt-auto h-36 w-full sm:h-40">
      <Line :data="chartData" :options="options" />
    </div>
    <div
      v-else
      class="mt-auto flex h-28 items-end rounded-xl bg-glow-hover-surface/60 px-3 py-4 font-urbanist text-xs text-glow-text-subtle"
    >
      Sem histórico de saldo no período.
    </div>
  </article>
</template>
