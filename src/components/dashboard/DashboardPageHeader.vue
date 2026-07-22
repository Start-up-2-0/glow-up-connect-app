<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  meta?: string
  greeting?: string
  compact?: boolean
}>()
</script>

<template>
  <header class="dashboard-page-header" :class="{ 'dashboard-page-header--compact': compact }">
    <div>
      <p v-if="greeting" class="dashboard-page-header__greeting">{{ greeting }}</p>
      <h1 class="dashboard-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="dashboard-page-header__subtitle">{{ subtitle }}</p>
      <p v-if="meta" class="dashboard-page-header__meta">{{ meta }}</p>
    </div>
    <div v-if="$slots.actions" class="dashboard-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
