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
      compact ? 'h-10 w-10' : 'h-[112px] w-[148px]',
      logoClass,
    ]"
  />
</template>
