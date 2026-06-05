<script setup lang="ts">
import logoUrl from '@/assets/logo/logo.png'

withDefaults(
  defineProps<{
    compact?: boolean
    logoClass?: string
  }>(),
  { compact: false },
)
</script>

<template>
  <img
    :src="logoUrl"
    alt="Glow Up Connect"
    :class="[
      'object-contain object-left',
      compact ? 'h-9 w-9' : 'h-[76px] w-auto max-w-[120px]',
      logoClass,
    ]"
  />
</template>
