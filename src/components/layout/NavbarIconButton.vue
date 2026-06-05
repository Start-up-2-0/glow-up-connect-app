<script setup lang="ts">
defineProps<{
  label: string
  active?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="relative inline-flex size-[46px] shrink-0 items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text transition-colors hover:bg-white hover:text-glow-text-soft"
    :aria-label="label"
    :aria-expanded="active"
  >
    <slot />
  </button>
</template>
