<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import DashboardTrendBadge from '@/components/dashboard/DashboardTrendBadge.vue'
import type { ReceitaDia } from '@/utils/dashboardNegocioUtils'

defineProps<{
  value: string
  trend?: number | null
  trendLabel?: string
  sparkline: ReceitaDia[]
  loading?: boolean
}>()

function barHeight(value: number, max: number): string {
  if (max <= 0) return '8%'
  return `${Math.max(8, Math.round((value / max) * 100))}%`
}
</script>

<template>
  <section class="dashboard-revenue-hero">
    <div class="dashboard-revenue-hero__main">
      <div class="dashboard-revenue-hero__label-row">
        <span class="dashboard-revenue-hero__icon-wrap dashboard-revenue-hero__icon-wrap--green">
          <DashboardIcon name="money" class="dashboard-revenue-hero__icon" />
        </span>
        <p class="dashboard-revenue-hero__label">Receita do mês</p>
      </div>

      <p v-if="loading" class="dashboard-revenue-hero__value dashboard-revenue-hero__value--loading">...</p>
      <p v-else class="dashboard-revenue-hero__value">{{ value }}</p>

      <DashboardTrendBadge
        :value="trend"
        :label="trendLabel ?? 'Comparado ao mês passado'"
      />
    </div>

    <div class="dashboard-revenue-hero__sparkline">
      <p class="dashboard-revenue-hero__sparkline-label">Últimos 7 dias</p>
      <div class="dashboard-revenue-hero__bars" aria-hidden="true">
        <span
          v-for="dia in sparkline"
          :key="dia.date"
          class="dashboard-revenue-hero__bar"
          :style="{
            height: barHeight(
              dia.value,
              Math.max(...sparkline.map((d) => d.value), 1),
            ),
          }"
          :title="`${dia.label}: ${dia.value}`"
        />
      </div>
    </div>
  </section>
</template>
