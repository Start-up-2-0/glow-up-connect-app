<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="equipe-page__header">
    <div class="equipe-page__header-main">
      <h1 class="equipe-page__title">{{ title }}</h1>
      <p v-if="subtitle" class="equipe-page__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="equipe-page__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
