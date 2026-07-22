<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import logoLight from '@/assets/logo/logo_original.png'
import logoDark from '@/assets/logo/logo_orignal_dark.png'
import { useAppStore } from '@/stores/app.store'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    mobile?: boolean
    sidebar?: boolean
    logoClass?: string
    /** Força logo clara (fundos lavanda fixos) */
    light?: boolean
  }>(),
  { compact: false, mobile: false, sidebar: false, light: false },
)

const { isDark } = storeToRefs(useAppStore())

const logoUrl = computed(() => {
  if (props.light) return logoLight
  return isDark.value ? logoDark : logoLight
})
</script>

<template>
  <img
    :src="logoUrl"
    alt="Glow Up Connect"
    :class="[
      'object-contain object-left',
      compact ? 'h-10 w-10' : sidebar ? 'app-logo--sidebar' : mobile ? 'h-[136px] w-[190px]' : 'h-[128px] w-[168px]',
      logoClass,
    ]"
  />
</template>
