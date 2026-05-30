<script setup lang="ts">
import { GLOW_RECOVERY_CONTENT_CLASS, GLOW_RECOVERY_LAYOUT_CLASS } from '@/constants/designTokens'
import AuthRecoveryStepper from '@/components/auth/recovery/AuthRecoveryStepper.vue'

const props = withDefaults(
  defineProps<{
    step: 1 | 2 | 3
    showStepper?: boolean
  }>(),
  {
    showStepper: true,
  },
)
</script>

<template>
  <div :class="GLOW_RECOVERY_LAYOUT_CLASS">
    <div :class="GLOW_RECOVERY_CONTENT_CLASS">
      <AuthRecoveryStepper v-if="props.showStepper" :step="props.step" />
      <slot />
    </div>
  </div>
</template>
