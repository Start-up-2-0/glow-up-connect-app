<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthOtpInput from '@/components/auth/recovery/AuthOtpInput.vue'
import { maskEmail } from '@/composables/useConfirmEmail'

const props = defineProps<{
  email: string
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  confirm: [codigo: string]
}>()

const codigo = ref('')
const invalidCode = ref(false)

const maskedEmail = computed(() => maskEmail(props.email))

async function handleComplete(value: string) {
  invalidCode.value = false
  emit('confirm', value)
}

function onInvalid() {
  invalidCode.value = true
  codigo.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="agendar-section-title">Confirme seu e-mail</h1>
      <p class="agendar-section-subtitle mt-2">
        Enviamos um código de 6 dígitos para
        <span class="font-semibold text-glow-gold">{{ maskedEmail }}</span
        >. Depois disso você recebe um e-mail para confirmar o WhatsApp.
      </p>
    </div>

    <AuthOtpInput v-model="codigo" :disabled="loading" @complete="handleComplete" />

    <p v-if="invalidCode || errorMessage" class="text-sm text-red-600" role="alert">
      {{ errorMessage || 'Código inválido ou expirado.' }}
    </p>

    <button
      type="button"
      class="text-sm font-medium text-glow-gold hover:underline"
      @click="onInvalid"
    >
      Limpar e digitar novamente
    </button>
  </div>
</template>
