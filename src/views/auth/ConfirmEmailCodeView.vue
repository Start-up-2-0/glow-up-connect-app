<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import AuthRecoveryBackLink from '@/components/auth/recovery/AuthRecoveryBackLink.vue'
import AuthRecoveryAlert from '@/components/auth/recovery/AuthRecoveryAlert.vue'
import AuthOtpInput from '@/components/auth/recovery/AuthOtpInput.vue'
import { maskEmail, useConfirmEmail } from '@/composables/useConfirmEmail'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { readRedirectParam, redirectQuery } from '@/utils/authRedirect'
import {
  GLOW_RECOVERY_BTN_SECONDARY_CLASS,
  GLOW_RECOVERY_INPUT_CLASS,
  GLOW_RECOVERY_LABEL_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

const route = useRoute()
const router = useRouter()
const notificationsStore = useNotificationsStore()
const {
  RESEND_COOLDOWN_SECONDS,
  setStoredEmail,
  getStoredEmail,
  confirmByCode,
  resendConfirmation,
} = useConfirmEmail()

const email = ref('')
const resendEmail = ref('')
const codigo = ref('')
const verifying = ref(false)
const resending = ref(false)
const cooldown = ref(0)
const invalidCodeError = ref(false)
const resendEmailError = ref('')

let cooldownTimer: ReturnType<typeof setInterval> | null = null

const hasKnownEmail = computed(() => Boolean(email.value.trim()))
const maskedEmail = computed(() => maskEmail(email.value))
const resendLabel = computed(() => {
  if (cooldown.value > 0) {
    const minutes = Math.floor(cooldown.value / 60)
    const seconds = cooldown.value % 60
    return `Reenviar em ${minutes}:${String(seconds).padStart(2, '0')}`
  }
  return 'Reenviar código'
})

onMounted(() => {
  const queryEmail = typeof route.query.email === 'string' ? route.query.email.trim() : ''
  const stored = getStoredEmail()

  if (queryEmail) {
    setStoredEmail(queryEmail)
    email.value = queryEmail
  } else if (stored) {
    email.value = stored
  }

  resendEmail.value = email.value
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

function startCooldown() {
  cooldown.value = RESEND_COOLDOWN_SECONDS
  if (cooldownTimer) clearInterval(cooldownTimer)

  cooldownTimer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleCodeComplete(value: string) {
  verifying.value = true
  invalidCodeError.value = false

  try {
    const result = await confirmByCode(value)

    if (result.ok) {
      await router.push({
        path: ROUTE_PATHS.CONFIRM_EMAIL_SUCCESS,
        query: redirectQuery(readRedirectParam(route.query.redirect)),
      })
      return
    }

    codigo.value = ''
    invalidCodeError.value = true
  } finally {
    verifying.value = false
  }
}

async function handleResend() {
  if (cooldown.value > 0 || resending.value) return

  resendEmailError.value = ''
  invalidCodeError.value = false

  const targetEmail = hasKnownEmail.value ? email.value.trim() : resendEmail.value.trim()
  if (!targetEmail) {
    resendEmailError.value = 'Informe o e-mail para reenviar a confirmação.'
    return
  }

  resending.value = true

  try {
    const result = await resendConfirmation(targetEmail)

    if (!result.ok) {
      if (result.missingEmail) {
        resendEmailError.value = 'Informe o e-mail para reenviar a confirmação.'
        return
      }
      notificationsStore.push('error', 'Não foi possível reenviar a confirmação. Tente novamente.')
      return
    }

    setStoredEmail(targetEmail)
    email.value = targetEmail
    resendEmail.value = targetEmail
    codigo.value = ''
    notificationsStore.push('info', result.message)
    startCooldown()
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <AuthRecoveryLayout :step="1" :show-stepper="false">
    <header class="mb-10 w-full text-center">
      <h1 :class="GLOW_RECOVERY_TITLE_CLASS">Confirme seu e-mail</h1>
      <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
        <template v-if="hasKnownEmail">
          Insira o código de 6 dígitos enviado para<br />
          <span class="font-semibold text-glow-gold-cta">{{ maskedEmail }}</span>
        </template>
        <template v-else>
          Insira o código de 6 dígitos enviado para o seu e-mail.
        </template>
      </p>
    </header>

    <div class="flex w-full flex-col gap-6">
      <AuthOtpInput
        v-model="codigo"
        :disabled="verifying"
        @complete="handleCodeComplete"
      />

      <AuthRecoveryAlert v-if="invalidCodeError">
        Código inválido ou expirado. Verifique e tente novamente.
      </AuthRecoveryAlert>

      <p class="font-inter text-xs font-semibold text-glow-text/60">
        Não recebi o código
      </p>

      <div v-if="!hasKnownEmail" class="flex flex-col gap-2">
        <label for="confirm-resend-email" :class="GLOW_RECOVERY_LABEL_CLASS">E-mail</label>
        <input
          id="confirm-resend-email"
          v-model="resendEmail"
          type="email"
          autocomplete="email"
          required
          placeholder="ex: usuário01@exemplo.com"
          :class="GLOW_RECOVERY_INPUT_CLASS"
        />
        <AuthRecoveryAlert v-if="resendEmailError">{{ resendEmailError }}</AuthRecoveryAlert>
      </div>

      <button
        type="button"
        :disabled="cooldown > 0 || resending"
        :class="GLOW_RECOVERY_BTN_SECONDARY_CLASS"
        @click="handleResend"
      >
        <span
          v-if="resending"
          class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-glow-text border-t-transparent"
        />
        {{ resendLabel }}
      </button>
    </div>

    <AuthRecoveryBackLink class="mt-6 self-start" />
  </AuthRecoveryLayout>
</template>
