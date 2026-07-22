<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
  variant?: 'default' | 'positive' | 'negative'
  accent?: 'green' | 'red' | 'blue' | 'gold' | 'neutral'
}>()
</script>

<template>
  <div class="financeiro-kpi-card">
    <div class="financeiro-kpi-card__header">
      <span
        v-if="accent"
        class="financeiro-kpi-card__accent"
        :class="`financeiro-kpi-card__accent--${accent}`"
        aria-hidden="true"
      />
      <p class="financeiro-kpi-card__label">{{ label }}</p>
    </div>
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
