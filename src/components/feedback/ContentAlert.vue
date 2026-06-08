<script setup lang="ts">
import BaseAlert from './BaseAlert.vue'

type AlertVariant = 'success' | 'error' | 'warning' | 'info'

withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    /** Reduz margem inferior quando o alerta fica entre elementos densos */
    compact?: boolean
  }>(),
  {
    variant: 'info',
    compact: false,
  },
)
</script>

<template>
  <BaseAlert
    :variant="variant"
    :title="title"
    :class="compact ? 'content-alert content-alert--compact' : 'content-alert'"
  >
    <slot />
  </BaseAlert>
</template>
