<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const bannerLabel = computed(
  () =>
    (typeof route.meta.title === 'string' ? route.meta.title : null) ??
    'Preview dev (Figma)',
)
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-glow-canvas">
    <header
      class="sticky top-0 z-50 border-b border-amber-300/40 bg-amber-50 px-4 py-2 dark:border-amber-700/40 dark:bg-amber-950/40"
    >
      <p class="text-center font-urbanist text-xs font-medium text-amber-900 dark:text-amber-200">
        {{ bannerLabel }} — disponível apenas em ambiente de desenvolvimento.
      </p>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
