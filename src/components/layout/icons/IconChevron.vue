<script setup lang="ts">
withDefaults(
  defineProps<{
    direction?: 'left' | 'right'
    size?: number
    class?: string
  }>(),
  { direction: 'left', size: 20 },
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
      v-if="direction === 'left'"
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      v-else
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
