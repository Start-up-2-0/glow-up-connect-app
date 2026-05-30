<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div>
    <h3>{{ title ?? 'Nada por aqui' }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
