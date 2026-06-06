<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="text-center">
    <h3 class="font-urbanist text-sm font-semibold text-glow-text">
      {{ title ?? 'Nada por aqui' }}
    </h3>
    <p v-if="description" class="mt-1 font-urbanist text-sm text-glow-text-subtle">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>
