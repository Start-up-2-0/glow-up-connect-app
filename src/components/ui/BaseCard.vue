<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    padding?: boolean
  }>(),
  { padding: true },
)
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-glow-border-soft bg-glow-surface',
      padding ? 'p-4' : '',
    ]"
  >
    <h2 v-if="title" class="mb-3 font-urbanist text-base font-semibold text-glow-text">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
