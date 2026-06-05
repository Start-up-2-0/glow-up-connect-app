<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    class?: string
  }>(),
  { size: 16 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    aria-hidden="true"
  >
    <path
      d="M4 6L8 8L12 6"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
