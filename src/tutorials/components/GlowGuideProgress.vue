<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
}>()

const pct = computed(() => {
  if (props.total <= 0) return 0
  return Math.min(100, Math.round((props.current / props.total) * 100))
})
</script>

<template>
  <div class="gg-progress" role="progressbar" :aria-valuenow="current" :aria-valuemin="1" :aria-valuemax="total">
    <div class="gg-progress__bar">
      <div class="gg-progress__fill" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>
