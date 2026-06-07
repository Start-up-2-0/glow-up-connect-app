<script setup lang="ts">
import type { MetodoPagamentoAssinatura } from '@/types/pagamento.types'

defineProps<{
  modelValue: MetodoPagamentoAssinatura
  permitePix?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: MetodoPagamentoAssinatura] }>()
</script>

<template>
  <div class="space-y-4">
    <div class="checkout-tabs">
      <button
        type="button"
        class="checkout-tab"
        :class="{ 'checkout-tab--active': modelValue === 'cartao' }"
        @click="emit('update:modelValue', 'cartao')"
      >
        Pagar com cartão
      </button>
      <button
        v-if="permitePix"
        type="button"
        class="checkout-tab"
        :class="{ 'checkout-tab--active': modelValue === 'pix' }"
        @click="emit('update:modelValue', 'pix')"
      >
        Pagar com PIX
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="checkout-method-chip"
        :class="{ 'checkout-method-chip--active': modelValue === 'cartao' }"
        @click="emit('update:modelValue', 'cartao')"
      >
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        <span>Cartão</span>
      </button>
      <button
        v-if="permitePix"
        type="button"
        class="checkout-method-chip"
        :class="{ 'checkout-method-chip--active': modelValue === 'pix' }"
        @click="emit('update:modelValue', 'pix')"
      >
        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true">
          <path d="M5.37 4.5h4.26v15H5.37zm8.27 0h5v15h-5zM4.5 5.37V9.6h15V5.37zm0 8.28v4.23h15v-4.23z" />
        </svg>
        <span>PIX</span>
      </button>
    </div>
  </div>
</template>
