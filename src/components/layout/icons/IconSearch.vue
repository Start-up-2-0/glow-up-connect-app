<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    class?: string
  }>(),
  { size: 20 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5" />
    <path d="M14 14L17.5 17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>
