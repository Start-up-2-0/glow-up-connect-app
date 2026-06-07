<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'

withDefaults(
  defineProps<{
    errorMessage?: string | null
    variant?: 'default' | 'checkout'
  }>(),
  {
    variant: 'default',
  },
)

const cpf = ref('')

function obterCpf(): string {
  return cpf.value
}

defineExpose({ obterCpf })
</script>

<template>
  <div class="space-y-4">
    <p v-if="variant === 'default'" class="text-sm text-glow-text-subtle">
      Gere o QR Code PIX para pagar a primeira cobrança. A confirmação pode levar alguns instantes após o pagamento.
    </p>
    <p v-else class="text-sm text-glow-text-subtle">
      Informe o CPF do pagador para gerar o QR Code. Após pagar, aguarde a confirmação automática.
    </p>
    <BaseInput v-model="cpf" label="CPF do pagador" placeholder="000.000.000-00" />
    <p v-if="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>
  </div>
</template>
