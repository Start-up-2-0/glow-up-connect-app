<script setup lang="ts">
withDefaults(
  defineProps<{
    expanded?: boolean
    size?: number
    class?: string
  }>(),
  { expanded: false, size: 20 },
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
    <path
      v-if="expanded"
      d="M5 12.5L10 7.5L15 12.5"
      fill="currentColor"
    />
    <path
      v-else
      d="M7.5 8L12.5 10L7.5 12"
      fill="currentColor"
    />
  </svg>
</template>
