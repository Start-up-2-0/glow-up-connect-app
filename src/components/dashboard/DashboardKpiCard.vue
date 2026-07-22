<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'

defineProps<{
  label: string
  value: string
  hint?: string
  icon: 'calendar' | 'money' | 'users' | 'star' | 'store' | 'user' | 'chart' | 'clock' | 'scissors'
  variant?: 'default' | 'gold' | 'positive' | 'negative'
  loading?: boolean
}>()
</script>

<template>
  <div class="dashboard-kpi" :class="`dashboard-kpi--${variant ?? 'default'}`">
    <div class="dashboard-kpi__head">
      <span class="dashboard-kpi__icon-wrap">
        <DashboardIcon :name="icon" class="dashboard-kpi__icon" />
      </span>
      <p class="dashboard-kpi__label">{{ label }}</p>
    </div>
    <p v-if="loading" class="dashboard-kpi__value dashboard-kpi__value--loading">...</p>
    <p v-else class="dashboard-kpi__value">{{ value }}</p>
    <p v-if="hint" class="dashboard-kpi__hint">{{ hint }}</p>
  </div>
</template>
