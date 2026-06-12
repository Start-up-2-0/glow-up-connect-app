<script setup lang="ts">
defineProps<{
  label: string
  active?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="agenda-filter-btn"
    :class="{ 'agenda-filter-btn--active': active }"
  >
    <slot name="icon" />
    <span>{{ label }}</span>
  </button>
</template>
