<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  greeting?: string
}>()
</script>

<template>
  <header class="dashboard-page-header">
    <div>
      <p v-if="greeting" class="dashboard-page-header__greeting">{{ greeting }}</p>
      <h1 class="dashboard-page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="dashboard-page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="dashboard-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
