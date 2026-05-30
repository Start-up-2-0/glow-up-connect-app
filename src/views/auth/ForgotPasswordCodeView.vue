<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import AuthRecoveryBackLink from '@/components/auth/recovery/AuthRecoveryBackLink.vue'
import AuthRecoveryAlert from '@/components/auth/recovery/AuthRecoveryAlert.vue'
import AuthRecoveryRateLimitAlert from '@/components/auth/recovery/AuthRecoveryRateLimitAlert.vue'
import AuthOtpInput from '@/components/auth/recovery/AuthOtpInput.vue'
import { maskEmail, useForgotPassword } from '@/composables/useForgotPassword'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_BTN_LOCKED_CLASS,
  GLOW_RECOVERY_BTN_SECONDARY_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

const router = useRouter()
const {
  RESEND_COOLDOWN_SECONDS,
  getStoredEmail,
  resendCode,
  requestNewCode,
  verifyCode,
} = useForgotPassword()

const email = ref('')
const codigo = ref('')
const verifying = ref(false)
const resending = ref(false)
const cooldown = ref(0)
const rateLimited = ref(false)
const invalidCodeError = ref(false)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

const maskedEmail = computed(() => maskEmail(email.value))
const resendLabel = computed(() => {
  if (rateLimited.value) return 'Reenviar'
  if (cooldown.value > 0) {
    const minutes = Math.floor(cooldown.value / 60)
    const seconds = cooldown.value % 60
    return `Reenviar em ${minutes}:${String(seconds).padStart(2, '0')}`
  }
  return 'Reenviar'
})

onMounted(() => {
  const stored = getStoredEmail()
  if (!stored) {
    void router.replace(ROUTE_PATHS.FORGOT_PASSWORD)
    return
  }
  email.value = stored
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
  if (rateLimited.value) return

  verifying.value = true
  invalidCodeError.value = false

  try {
    const result = await verifyCode(value)

    if (result.valid) {
      await router.push(ROUTE_PATHS.RESET_PASSWORD)
      return
    }

    codigo.value = ''

    if (result.rateLimited) {
      rateLimited.value = true
      invalidCodeError.value = false
      return
    }

    if (result.invalid) {
      invalidCodeError.value = true
    }
  } finally {
    verifying.value = false
  }
}

async function handleResend() {
  if (cooldown.value > 0 || resending.value || rateLimited.value) return

  resending.value = true
  invalidCodeError.value = false

  try {
    const result = await resendCode()

    if (result.rateLimited) {
      rateLimited.value = true
      return
    }

    codigo.value = ''
    startCooldown()
  } finally {
    resending.value = false
  }
}

async function handleRequestNewCode() {
  resending.value = true

  try {
    await requestNewCode()
    rateLimited.value = false
    invalidCodeError.value = false
    codigo.value = ''
    cooldown.value = 0
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
    startCooldown()
  } finally {
    resending.value = false
  }
}

function goToChangeEmail() {
  void router.push(ROUTE_PATHS.FORGOT_PASSWORD)
}
</script>

<template>
  <AuthRecoveryLayout :step="2">
    <header class="mb-10 w-full text-center">
      <h1 :class="GLOW_RECOVERY_TITLE_CLASS">Verifique o seu e-mail</h1>
      <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
        Insira o código que foi enviado para<br />
        <span class="font-semibold text-[#e4ac04]">{{ maskedEmail }}</span>
      </p>
    </header>

    <div class="flex w-full flex-col gap-6">
      <AuthOtpInput
        v-model="codigo"
        :disabled="verifying || rateLimited"
        @complete="handleCodeComplete"
      />

      <AuthRecoveryAlert v-if="invalidCodeError && !rateLimited">
        Código inválido. Verifique e tente novamente.
      </AuthRecoveryAlert>

      <p class="font-inter text-xs font-semibold text-glow-text/60">
        Não recebi o código
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
          @click="goToChangeEmail"
        >
          Alterar e-mail
        </button>

        <button
          v-if="rateLimited"
          type="button"
          disabled
          :class="GLOW_RECOVERY_BTN_LOCKED_CLASS"
        >
          <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M5.5 7V5a2.5 2.5 0 015 0v2"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
          Reenviar
        </button>

        <button
          v-else
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

      <AuthRecoveryRateLimitAlert v-if="rateLimited" @request-new="handleRequestNewCode" />
    </div>

    <AuthRecoveryBackLink class="mt-6 self-start" />
  </AuthRecoveryLayout>
</template>
