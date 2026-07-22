<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'

export interface DashboardQuickAction {
  id: string
  label: string
  description?: string
  icon: 'calendar' | 'money' | 'users' | 'star' | 'store' | 'user' | 'chart' | 'clock' | 'scissors' | 'heart'
}

defineProps<{
  title?: string
  actions: DashboardQuickAction[]
}>()

defineEmits<{
  action: [id: string]
}>()
</script>

<template>
  <section class="dashboard-quick-actions">
    <h2 v-if="title" class="dashboard-quick-actions__title">{{ title }}</h2>
    <div class="dashboard-quick-actions__grid">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="dashboard-quick-actions__item"
        @click="$emit('action', action.id)"
      >
        <span class="dashboard-quick-actions__icon-wrap">
          <DashboardIcon :name="action.icon" class="dashboard-quick-actions__icon" />
        </span>
        <span class="dashboard-quick-actions__content">
          <span class="dashboard-quick-actions__label">{{ action.label }}</span>
          <span v-if="action.description" class="dashboard-quick-actions__desc">{{ action.description }}</span>
        </span>
      </button>
    </div>
  </section>
</template>
