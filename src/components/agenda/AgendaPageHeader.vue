<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  dateLabel?: string
}>()
</script>

<template>
  <header class="agenda-page__header">
    <div>
      <div class="agenda-page__title-row">
        <h1 class="agenda-page__title">{{ title }}</h1>
        <span v-if="dateLabel" class="agenda-page__title-date">
          <span class="agenda-page__title-dot" aria-hidden="true" />
          {{ dateLabel }}
        </span>
      </div>
      <p class="agenda-page__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.filters" class="agenda-page__filters">
      <slot name="filters" />
    </div>
  </header>
</template>
