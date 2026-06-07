<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthOtpInput from '@/components/auth/recovery/AuthOtpInput.vue'
import { maskEmail } from '@/composables/useConfirmEmail'
import { GLOW_RECOVERY_SUBTITLE_CLASS, GLOW_RECOVERY_TITLE_CLASS } from '@/constants/designTokens'

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
  <div>
    <header class="mb-6">
      <h2 :class="GLOW_RECOVERY_TITLE_CLASS">Confirme seu e-mail</h2>
      <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2 text-left']">
        Enviamos um código de 6 dígitos para
        <span class="font-semibold text-glow-gold">{{ maskedEmail }}</span
        >. Depois disso você segue para o cadastro do estabelecimento.
      </p>
    </header>

    <AuthOtpInput v-model="codigo" :disabled="loading" @complete="handleComplete" />

    <p v-if="invalidCode || errorMessage" class="mt-4 text-sm text-red-600" role="alert">
      {{ errorMessage || 'Código inválido ou expirado.' }}
    </p>

    <button
      type="button"
      class="mt-6 text-sm font-medium text-glow-gold hover:underline"
      @click="onInvalid"
    >
      Limpar e digitar novamente
    </button>
  </div>
</template>
