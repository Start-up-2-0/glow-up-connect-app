<script setup lang="ts">
import { CircleHelp, Sparkles } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label?: string
    compact?: boolean
  }>(),
  {
    label: 'Tutorial',
    compact: false,
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="gg-launcher"
    :class="{ 'gg-launcher--compact': compact }"
    :aria-label="compact ? 'Tutorial desta página' : undefined"
    :title="compact ? 'Tutorial desta página' : undefined"
    @click="emit('click')"
  >
    <Sparkles class="gg-launcher__icon" aria-hidden="true" />
    <span v-if="!compact" class="gg-launcher__label">{{ label }}</span>
    <CircleHelp v-else class="sr-only" />
  </button>
</template>
