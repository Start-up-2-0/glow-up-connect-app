<script setup lang="ts">
import { formatCurrency } from '@/utils/formatters'
import { AGENDAR_BTN_CONTINUE_CLASS } from '@/constants/designTokens'

defineProps<{
  servicosCount: number
  duracaoTotal: number
  valorTotal: number
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  continuar: []
}>()
</script>

<template>
  <div class="agendar-resumo-footer">
    <div class="mx-auto flex max-w-[695px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="font-urbanist text-sm text-glow-text">
        <p>
          <span class="font-semibold">{{ servicosCount }}</span>
          {{ servicosCount === 1 ? 'serviço selecionado' : 'serviços selecionados' }}
        </p>
        <p class="text-glow-text-subtle">
          {{ duracaoTotal }} min · {{ formatCurrency(valorTotal) }}
        </p>
      </div>
      <button
        type="button"
        :class="[AGENDAR_BTN_CONTINUE_CLASS, 'sm:max-w-[240px]']"
        :disabled="disabled || loading"
        @click="emit('continuar')"
      >
        {{ loading ? 'Carregando…' : 'Continuar' }}
      </button>
    </div>
  </div>
</template>
