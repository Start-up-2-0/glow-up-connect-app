<script setup lang="ts">
import logoUrl from '@/assets/logo/logo_original.png'

withDefaults(
  defineProps<{
    compact?: boolean
    mobile?: boolean
    sidebar?: boolean
    logoClass?: string
  }>(),
  { compact: false, mobile: false, sidebar: false },
)
</script>

<template>
  <img
    :src="logoUrl"
    alt="Glow Up Connect"
    :class="[
      'object-contain object-left',
      compact ? 'h-10 w-10' : sidebar ? 'app-logo--sidebar' : mobile ? 'h-[120px] w-[168px]' : 'h-[112px] w-[148px]',
      logoClass,
    ]"
  />
</template>
