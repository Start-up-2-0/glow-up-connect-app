<script setup lang="ts">
import IconChevron from './icons/IconChevron.vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex size-[46px] shrink-0 items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text-hover transition-colors hover:text-glow-text"
    :aria-label="collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'"
    @click="$emit('toggle')"
  >
    <IconChevron :direction="collapsed ? 'right' : 'left'" />
  </button>
</template>
