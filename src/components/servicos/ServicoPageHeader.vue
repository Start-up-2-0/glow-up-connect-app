<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  metaPreco?: string
  metaDuracao?: string
}>()
</script>

<template>
  <header class="servicos-page__header">
    <div class="servicos-page__header-main">
      <div class="servicos-page__header-row">
        <RouterLink
          v-if="backTo"
          :to="backTo"
          class="servicos-page__back"
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
          <h1 class="servicos-page__title">{{ title }}</h1>
          <p v-if="subtitle && !metaPreco" class="servicos-page__subtitle">{{ subtitle }}</p>
          <div v-if="metaPreco || metaDuracao" class="servicos-page__meta">
            <span v-if="metaPreco">{{ metaPreco }}</span>
            <span v-if="metaPreco && metaDuracao" class="servicos-page__meta-dot" aria-hidden="true" />
            <span v-if="metaDuracao">{{ metaDuracao }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="$slots.actions" class="servicos-page__actions">
      <slot name="actions" />
    </div>
  </header>
</template>
