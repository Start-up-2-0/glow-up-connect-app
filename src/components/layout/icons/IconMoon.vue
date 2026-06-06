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
    <path
      d="M12 17.5C15.0376 17.5 17.5 15.0376 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 15.0376 8.96243 17.5 12 17.5Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M12 4V5.5M12 18.5V20M20 12H18.5M5.5 12H4M17.3033 6.6967L16.2426 7.75736M7.75736 16.2426L6.6967 17.3033M17.3033 17.3033L16.2426 16.2426M7.75736 7.75736L6.6967 6.6967"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
