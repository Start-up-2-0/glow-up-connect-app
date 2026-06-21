<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="horarios-page__header">
    <div class="horarios-page__header-main">
      <h1 class="horarios-page__title">{{ title }}</h1>
      <p v-if="subtitle" class="horarios-page__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="horarios-page__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
