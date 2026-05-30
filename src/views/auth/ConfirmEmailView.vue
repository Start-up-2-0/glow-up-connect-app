<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import AuthRecoveryAlert from '@/components/auth/recovery/AuthRecoveryAlert.vue'
import AuthRecoveryBackLink from '@/components/auth/recovery/AuthRecoveryBackLink.vue'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_BTN_SECONDARY_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

type ConfirmState = 'loading' | 'success' | 'error' | 'idle'

const route = useRoute()
const router = useRouter()
const { resolveError } = useApiError()
const notificationsStore = useNotificationsStore()
const { confirmByToken, resendConfirmation, getStoredEmail } = useConfirmEmail()

const state = ref<ConfirmState>('idle')
const errorMessage = ref('')
const resending = ref(false)

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : null

  if (!token) {
    await router.replace(ROUTE_PATHS.CONFIRM_EMAIL_CODE)
    return
  }

  state.value = 'loading'

  try {
    const result = await confirmByToken(token)

    if (result.ok) {
      await router.replace(ROUTE_PATHS.CONFIRM_EMAIL_SUCCESS)
      return
    }

    state.value = 'error'
    errorMessage.value = 'Link de confirmação inválido ou expirado.'
  } catch (err) {
    state.value = 'error'
    errorMessage.value = resolveError(err, 'Não foi possível confirmar o e-mail.')
  }
})

async function goToCodeEntry() {
  await router.push(ROUTE_PATHS.CONFIRM_EMAIL_CODE)
}

async function handleResend() {
  if (resending.value) return

  if (!getStoredEmail()) {
    errorMessage.value = 'Informe o código manualmente na próxima tela ou faça login para reenviar.'
    await goToCodeEntry()
    return
  }

  resending.value = true

  try {
    const result = await resendConfirmation()

    if (!result.ok) {
      notificationsStore.push('error', 'Não foi possível reenviar a confirmação. Tente novamente.')
      return
    }

    notificationsStore.push('info', result.message)
    await goToCodeEntry()
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <AuthRecoveryLayout :step="1" :show-stepper="false">
    <header class="mb-10 w-full text-center">
      <h1 :class="GLOW_RECOVERY_TITLE_CLASS">Confirmar e-mail</h1>
      <p v-if="state === 'loading'" :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
        Confirmando seu e-mail...
      </p>
    </header>

    <div v-if="state === 'loading'" class="flex w-full justify-center py-8">
      <span
        class="inline-block size-10 animate-spin rounded-full border-2 border-glow-gold border-t-transparent"
        aria-hidden="true"
      />
    </div>

    <div v-else-if="state === 'error'" class="flex w-full flex-col gap-6">
      <AuthRecoveryAlert>{{ errorMessage }}</AuthRecoveryAlert>

      <button
        type="button"
        :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
        @click="goToCodeEntry"
      >
        Digitar código manualmente
      </button>

      <button
        type="button"
        :disabled="resending"
        :class="GLOW_RECOVERY_BTN_SECONDARY_CLASS"
        @click="handleResend"
      >
        <span
          v-if="resending"
          class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-glow-text border-t-transparent"
        />
        Reenviar confirmação
      </button>
    </div>

    <AuthRecoveryBackLink v-if="state !== 'loading'" class="mt-6 self-start" />
  </AuthRecoveryLayout>
</template>
