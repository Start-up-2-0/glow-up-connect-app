<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'

defineProps<{
  errorMessage?: string | null
}>()

const cpf = ref('')

function obterCpf(): string {
  return cpf.value
}

defineExpose({ obterCpf })
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-glow-text-subtle">
      Gere o QR Code PIX para pagar a primeira cobrança. A confirmação pode levar alguns instantes após o pagamento.
    </p>
    <BaseInput v-model="cpf" label="CPF do pagador" placeholder="000.000.000-00" />
    <p v-if="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>
  </div>
</template>
