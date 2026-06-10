<script setup lang="ts">
import { computed } from 'vue'
import { AGENDAR_CARD_CLASS } from '@/constants/designTokens'

const props = defineProps<{
  nome: string
  estabelecimentoNome?: string
  compact?: boolean
}>()

const iniciais = computed(() => {
  const parts = props.nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
})
</script>

<template>
  <div :class="[AGENDAR_CARD_CLASS, compact ? 'p-4' : 'p-5']">
    <p v-if="compact" class="mb-3 font-urbanist text-base font-semibold text-glow-text">
      Profissional
    </p>
    <div class="flex items-center gap-4">
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-glow-text/10 font-urbanist text-sm font-semibold text-glow-text"
        aria-hidden="true"
      >
        {{ iniciais }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-base font-semibold text-glow-text">{{ nome }}</p>
        <p
          v-if="estabelecimentoNome"
          class="mt-1 flex items-center gap-1 font-urbanist text-xs text-glow-text-subtle"
        >
          <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.5-2-4.5-4.5-4.5Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <circle cx="8" cy="6" r="1.5" fill="currentColor" />
          </svg>
          {{ estabelecimentoNome }}
        </p>
      </div>
    </div>
  </div>
</template>
