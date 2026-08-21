<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  dateLabel?: string
}>()
</script>

<template>
  <header class="agenda-page__header">
    <div class="min-w-0 flex-1">
      <div class="agenda-page__title-row">
        <h1 class="agenda-page__title">{{ title }}</h1>
        <span v-if="dateLabel" class="agenda-page__title-date">
          <span class="agenda-page__title-dot" aria-hidden="true" />
          {{ dateLabel }}
        </span>
      </div>
      <p class="agenda-page__subtitle">{{ subtitle }}</p>
    </div>
    <div
      v-if="$slots.actions || $slots.filters"
      class="flex min-w-0 flex-col items-stretch gap-3 sm:items-end"
    >
      <div v-if="$slots.actions" class="agenda-page__actions">
        <slot name="actions" />
      </div>
      <div v-if="$slots.filters" class="agenda-page__filters">
        <slot name="filters" />
      </div>
    </div>
  </header>
</template>
