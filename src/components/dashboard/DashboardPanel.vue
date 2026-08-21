<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'

defineProps<{
  title: string
  subtitle?: string
  emptyTitle?: string
  emptyDescription?: string
  linkLabel?: string
  loading?: boolean
  empty?: boolean
}>()

defineEmits<{
  link: []
}>()
</script>

<template>
  <section class="dashboard-panel">
    <div class="dashboard-panel__header">
      <div>
        <h2 class="dashboard-panel__title">{{ title }}</h2>
        <p v-if="subtitle" class="dashboard-panel__subtitle">{{ subtitle }}</p>
      </div>
      <button
        v-if="linkLabel"
        type="button"
        class="dashboard-panel__link"
        @click="$emit('link')"
      >
        {{ linkLabel }}
        <DashboardIcon name="arrow-right" class="dashboard-panel__link-icon" />
      </button>
    </div>

    <div v-if="loading" class="dashboard-panel__empty">Carregando...</div>
    <div v-else-if="empty" class="dashboard-panel__empty">
      <p class="dashboard-panel__empty-title">{{ emptyTitle ?? 'Nenhum registro' }}</p>
      <p v-if="emptyDescription" class="dashboard-panel__empty-desc">{{ emptyDescription }}</p>
    </div>
    <div v-else class="dashboard-panel__body">
      <slot />
    </div>
  </section>
</template>
