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
      'object-contain',
      compact ? 'h-8 w-8' : 'h-[52px] w-auto',
      logoClass,
    ]"
  />
</template>
