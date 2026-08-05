<script setup lang="ts">
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { AGENDAR_CARD_CLASS } from '@/constants/designTokens'

defineProps<{
  nome: string
  foto?: string | null
  estabelecimentoNome?: string
  compact?: boolean
}>()
</script>

<template>
  <div :class="[AGENDAR_CARD_CLASS, 'agendar-profissional-card', compact ? 'p-4' : 'p-5']">
    <p v-if="compact" class="mb-3 font-urbanist text-base font-semibold text-glow-text">
      Profissional
    </p>
    <div class="flex items-center gap-4">
      <UserAvatar :src="foto" :name="nome" size="md" class="!size-12" />
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
