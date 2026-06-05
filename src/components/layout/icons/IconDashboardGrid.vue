<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    class?: string
  }>(),
  { size: 28 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="8.5" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
    <rect x="15.5" y="4" width="8.5" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
    <rect x="4" y="15.5" width="8.5" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
    <rect x="15.5" y="15.5" width="8.5" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
  </svg>
</template>
