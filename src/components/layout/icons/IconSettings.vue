<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    class?: string
  }>(),
  { size: 24 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
    <path
      d="M12 4.5V6.5M12 17.5V19.5M19.5 12H17.5M6.5 12H4.5M17.3033 6.6967L15.8891 8.11091M8.11091 15.8891L6.6967 17.3033M17.3033 17.3033L15.8891 15.8891M8.11091 8.11091L6.6967 6.6967"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
