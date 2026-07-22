<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import DashboardTrendBadge from '@/components/dashboard/DashboardTrendBadge.vue'
import DashboardStarRating from '@/components/dashboard/DashboardStarRating.vue'
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  hint?: string
  icon: 'calendar' | 'money' | 'users' | 'star' | 'store' | 'user' | 'chart' | 'clock' | 'scissors'
  variant?: 'default' | 'gold' | 'positive' | 'negative'
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'gold'
  trend?: number | null
  trendLabel?: string
  subStats?: { label: string; value: string }[]
  loading?: boolean
  rating?: { nota: number; total: number }
}>()

const toneClass = computed(() => {
  if (props.color) return `dashboard-kpi--${props.color}`
  if (props.variant === 'gold') return 'dashboard-kpi--gold'
  if (props.variant === 'positive') return 'dashboard-kpi--green'
  if (props.variant === 'negative') return 'dashboard-kpi--orange'
  return 'dashboard-kpi--default'
})
</script>

<template>
  <div class="dashboard-kpi" :class="toneClass">
    <div class="dashboard-kpi__head">
      <span class="dashboard-kpi__icon-wrap">
        <DashboardIcon :name="icon" class="dashboard-kpi__icon" />
      </span>
      <p class="dashboard-kpi__label">{{ label }}</p>
    </div>

    <p v-if="loading" class="dashboard-kpi__value dashboard-kpi__value--loading">...</p>
    <p v-else class="dashboard-kpi__value">{{ value }}</p>

    <DashboardTrendBadge v-if="trend != null" :value="trend" :label="trendLabel" />

    <DashboardStarRating
      v-if="rating"
      :nota="rating.nota"
      :total="rating.total"
      :loading="loading"
    />

    <ul v-if="subStats?.length" class="dashboard-kpi__substats">
      <li v-for="stat in subStats" :key="stat.label" class="dashboard-kpi__substat">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </li>
    </ul>

    <p v-if="hint" class="dashboard-kpi__hint">{{ hint }}</p>
  </div>
</template>
