<script setup lang="ts">
defineProps<{
  label: string
  value: string
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
  </div>
</template>
