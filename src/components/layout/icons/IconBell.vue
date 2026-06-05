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
      d="M9.5 18H14.5C14.5 19.3807 13.3807 20.5 12 20.5C10.6193 20.5 9.5 19.3807 9.5 18Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M6.5 15.5H17.5L16 13.5V10.5C16 7.73858 14.2091 5.5 12 5.5C9.79086 5.5 8 7.73858 8 10.5V13.5L6.5 15.5Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </svg>
</template>
