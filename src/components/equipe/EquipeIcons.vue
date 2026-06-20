<script setup lang="ts">
defineProps<{
  name: 'plus' | 'link' | 'email' | 'phone' | 'close'
}>()
</script>

<template>
  <svg
    v-if="name === 'plus'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'link'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6.5 9.5L9.5 6.5M7.2 4.8L5.9 3.5C4.7 2.3 2.8 2.3 1.6 3.5C0.4 4.7 0.4 6.6 1.6 7.8L2.9 9.1M9.1 6.9L10.4 8.2C11.6 9.4 11.6 11.3 10.4 12.5C9.2 13.7 7.3 13.7 6.1 12.5L4.8 11.2"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'email'"
    class="equipe-member-card__meta-icon"
    viewBox="0 0 12 11"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 2.5L6 6.5L11 2.5M1.5 9.5H10.5C10.7761 9.5 11 9.27614 11 9V2C11 1.72386 10.7761 1.5 10.5 1.5H1.5C1.22386 1.5 1 1.72386 1 2V9C1 9.27614 1.22386 9.5 1.5 9.5Z"
      stroke="currentColor"
      stroke-width="0.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'phone'"
    class="equipe-member-card__meta-icon"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.2 2.5H5.8L6.6 5.4L5.3 6.1C5.9 7.4 6.9 8.4 8.2 9L8.9 7.7L11.8 8.5V10.1C11.8 10.4 11.6 10.7 11.3 10.8C10.2 11.1 9 11.2 7.8 10.9C5.6 10.3 3.7 8.4 3.1 6.2C2.8 5 2.9 3.8 3.2 2.7C3.3 2.4 3.6 2.2 3.9 2.2L4.2 2.5Z"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'close'"
    class="size-3"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 2L10 10M10 2L2 10"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
