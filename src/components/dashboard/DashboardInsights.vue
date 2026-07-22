<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import type { DashboardInsight } from '@/utils/dashboardNegocioUtils'

defineProps<{
  insights: DashboardInsight[]
  loading?: boolean
}>()
</script>

<template>
  <section v-if="loading || insights.length" class="dashboard-insights">
    <h2 class="dashboard-insights__title">Insights</h2>
    <ul class="dashboard-insights__list">
      <li
        v-for="insight in insights"
        :key="insight.id"
        class="dashboard-insights__item"
        :class="`dashboard-insights__item--${insight.tone}`"
      >
        <span class="dashboard-insights__icon-wrap">
          <DashboardIcon :name="insight.icon" class="dashboard-insights__icon" />
        </span>
        <p class="dashboard-insights__message">{{ insight.message }}</p>
      </li>
    </ul>
  </section>
</template>
