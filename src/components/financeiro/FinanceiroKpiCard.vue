<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
  variant?: 'default' | 'positive' | 'negative'
}>()
</script>

<template>
  <div class="financeiro-kpi-card">
    <p class="financeiro-kpi-card__label">{{ label }}</p>
    <p
      class="financeiro-kpi-card__value"
      :class="{
        'financeiro-kpi-card__value--positive': variant === 'positive',
        'financeiro-kpi-card__value--negative': variant === 'negative',
      }"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 font-urbanist text-xs text-glow-text-subtle">{{ hint }}</p>
  </div>
</template>
