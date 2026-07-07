<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="financeiro-empty">
    <p class="financeiro-empty__title">{{ title }}</p>
    <p v-if="description" class="financeiro-empty__desc">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>
