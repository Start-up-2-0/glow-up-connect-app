<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    active?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <button
    type="button"
    class="relative inline-flex shrink-0 items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text transition-colors hover:bg-glow-hover-surface hover:text-glow-text-soft"
    :class="size === 'sm' ? 'size-9' : size === 'lg' ? 'size-[46px]' : 'size-10'"
    :aria-label="label"
    :aria-expanded="active"
  >
    <slot />
  </button>
</template>
