<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
  backTo: string
}>()
</script>

<template>
  <header class="agendamento-detail-header">
    <RouterLink :to="backTo" class="agendamento-detail-back" aria-label="Voltar">
      <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </RouterLink>
    <div class="agendamento-detail-header__text">
      <h1 class="agendamento-detail-title">{{ title }}</h1>
      <p v-if="subtitle" class="agendamento-detail-subtitle">{{ subtitle }}</p>
    </div>
    <slot name="badge" />
  </header>
</template>
