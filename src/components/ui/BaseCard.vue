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
  <div :class="padding ? 'p-4' : ''">
    <h2 v-if="title">{{ title }}</h2>
    <slot />
  </div>
</template>
