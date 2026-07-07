<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}>()
</script>

<template>
  <header class="financeiro-page__header">
    <div class="financeiro-page__header-main">
      <div class="financeiro-page__header-row">
        <RouterLink
          v-if="backTo"
          :to="backTo"
          class="financeiro-page__back"
          :aria-label="backLabel ?? 'Voltar'"
        >
          <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>
        <div class="min-w-0">
          <h1 class="financeiro-page__title">{{ title }}</h1>
          <p v-if="subtitle" class="financeiro-page__subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="$slots.filters" class="financeiro-page__filters mt-4">
        <slot name="filters" />
      </div>
    </div>
    <div v-if="$slots.actions" class="financeiro-page__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
