<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
  }>(),
  {
    subtitle: undefined,
  },
)
</script>

<template>
  <article class="mx-auto max-w-3xl">
    <header class="mb-8 border-b border-glow-border-soft pb-6">
      <p class="text-sm font-medium text-glow-gold-dark">Documento legal</p>
      <h1 class="mt-2 font-urbanist text-3xl font-semibold text-glow-text">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-2 text-sm text-glow-text-subtle">
        {{ subtitle }}
      </p>
    </header>

    <div class="prose-legal space-y-6 text-sm leading-relaxed text-glow-text-subtle">
      <slot />
    </div>

    <footer class="mt-10 flex flex-wrap gap-4 border-t border-glow-border-soft pt-6 text-sm">
      <RouterLink :to="ROUTE_PATHS.TERMOS_DE_USO" class="text-glow-gold-dark hover:underline">
        Termos de uso
      </RouterLink>
      <RouterLink :to="ROUTE_PATHS.POLITICA_COOKIES" class="text-glow-gold-dark hover:underline">
        Política de cookies
      </RouterLink>
      <RouterLink to="/" class="text-glow-gold-dark hover:underline">
        Voltar ao início
      </RouterLink>
    </footer>
  </article>
</template>

<style scoped>
.prose-legal :deep(h2) {
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--glow-text, #282828);
}

.prose-legal :deep(ul) {
  margin-left: 1.25rem;
  list-style: disc;
}

.prose-legal :deep(li) {
  margin-top: 0.35rem;
}

.prose-legal :deep(p) {
  margin-top: 0.5rem;
}
</style>
