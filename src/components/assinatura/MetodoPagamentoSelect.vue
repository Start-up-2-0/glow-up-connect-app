<script setup lang="ts">
import type { MetodoPagamentoAssinatura } from '@/types/pagamento.types'

defineProps<{
  modelValue: MetodoPagamentoAssinatura
  permitePix?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: MetodoPagamentoAssinatura] }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="font-urbanist text-sm font-medium text-glow-text">Forma de pagamento</span>
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        class="rounded-lg border px-4 py-3 text-left text-sm transition-colors"
        :class="
          modelValue === 'cartao'
            ? 'border-glow-gold bg-glow-gold/10 text-glow-text'
            : 'border-glow-border-soft bg-glow-surface text-glow-text-subtle hover:border-glow-gold/50'
        "
        @click="emit('update:modelValue', 'cartao')"
      >
        <span class="block font-medium">Cartão de crédito</span>
        <span class="mt-1 block text-xs opacity-80">
          {{ permitePix ? 'Período de teste disponível' : 'Cobrança recorrente' }}
        </span>
      </button>
      <button
        v-if="permitePix"
        type="button"
        class="rounded-lg border px-4 py-3 text-left text-sm transition-colors"
        :class="
          modelValue === 'pix'
            ? 'border-glow-gold bg-glow-gold/10 text-glow-text'
            : 'border-glow-border-soft bg-glow-surface text-glow-text-subtle hover:border-glow-gold/50'
        "
        @click="emit('update:modelValue', 'pix')"
      >
        <span class="block font-medium">PIX</span>
        <span class="mt-1 block text-xs opacity-80">Pagamento imediato da 1ª cobrança</span>
      </button>
    </div>
  </div>
</template>
