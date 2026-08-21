<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import AuthRecoveryBackLink from '@/components/auth/recovery/AuthRecoveryBackLink.vue'
import AuthRecoveryAlert from '@/components/auth/recovery/AuthRecoveryAlert.vue'
import { useForgotPassword } from '@/composables/useForgotPassword'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_INPUT_CLASS,
  GLOW_RECOVERY_LABEL_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

const router = useRouter()
const { sendCode } = useForgotPassword()

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await sendCode(email.value)

    if (!result.ok) {
      errorMessage.value = result.error
      return
    }

    await router.push(ROUTE_PATHS.FORGOT_PASSWORD_CODE)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthRecoveryLayout :step="1">
    <header class="mb-10 w-full text-center">
      <h1 :class="GLOW_RECOVERY_TITLE_CLASS">Esqueceu a sua senha?</h1>
      <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
        Informe o e-mail da sua conta. Enviaremos um código de 6 dígitos para resetar a sua senha.
      </p>
    </header>

    <form class="flex w-full flex-col gap-6" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-2">
        <label for="recovery-email" :class="GLOW_RECOVERY_LABEL_CLASS">E-mail</label>
        <input
          id="recovery-email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          placeholder="ex: usuário01@exemplo.com"
          :class="GLOW_RECOVERY_INPUT_CLASS"
        />
      </div>

      <AuthRecoveryAlert v-if="errorMessage" :message="errorMessage" />

      <button
        type="submit"
        :disabled="loading"
        :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
      >
        <span
          v-if="loading"
          class="mr-2 inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        Enviar código
      </button>
    </form>

    <AuthRecoveryBackLink class="mt-6 self-start" />
  </AuthRecoveryLayout>
</template>
