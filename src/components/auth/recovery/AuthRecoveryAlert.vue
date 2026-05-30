<script setup lang="ts">
import { GLOW_RECOVERY_ALERT_CLASS } from '@/constants/designTokens'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div :class="GLOW_RECOVERY_ALERT_CLASS" role="alert">
    <svg class="size-3 shrink-0" viewBox="0 0 12 11" fill="none" aria-hidden="true">
      <path
        d="M6 0.5L11.1962 9.5H0.803848L6 0.5Z"
        fill="#CF3F3F"
        stroke="#CF3F3F"
        stroke-linejoin="round"
      />
      <path d="M6 4V6.5" stroke="white" stroke-linecap="round" />
      <circle cx="6" cy="8.25" r="0.5" fill="white" />
    </svg>
    <span><slot>{{ message }}</slot></span>
  </div>
</template>
