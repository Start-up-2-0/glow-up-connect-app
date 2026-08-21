<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { FileText } from 'lucide-vue-next'
import { ROUTE_PATHS } from '@/constants/routes'

defineProps<{
  titulo?: string
  subtitulo?: string
}>()
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
        {{ titulo ?? 'Assinatura' }}
      </h1>
      <p class="mt-1.5 max-w-xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        {{
          subtitulo ??
          'Gerencie seu plano e acompanhe as informações da sua assinatura.'
        }}
      </p>
    </div>
    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS"
        class="assinatura-btn-secondary inline-flex items-center gap-2"
      >
        <FileText :size="16" :stroke-width="1.75" />
        Ver faturas
      </RouterLink>
      <slot name="actions" />
    </div>
  </header>
</template>
