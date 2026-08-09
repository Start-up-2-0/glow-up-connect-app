<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import loginCrest from '@/assets/logo/logo_original.png'
import loginBackground from '@/assets/auth/login-background.webp'
import { useAuth } from '@/composables/useAuth'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  authRouteWithRedirect,
  isOnboardingCheckoutPath,
  readRedirectParam,
  redirectQuery,
} from '@/utils/authRedirect'
import { useCaptcha } from '@/composables/useCaptcha'
import AuthRecaptcha from '@/components/auth/AuthRecaptcha.vue'

const REMEMBER_EMAIL_KEY = 'guc_remember_email'

const route = useRoute()
const router = useRouter()
const { login, loading } = useAuth()
const { setStoredEmail } = useConfirmEmail()
const { resolveError, resolveErrorCode } = useApiError()
const notificationsStore = useNotificationsStore()
const captchaRef = ref<InstanceType<typeof AuthRecaptcha> | null>(null)
const captchaResetNonce = ref(0)
const { enabled: captchaEnabled } = useCaptcha()

const email = ref('')
const senha = ref('')
const lembrarConta = ref(false)
const errorMessage = ref('')
const checkoutRedirect = computed(() => readRedirectParam(route.query.redirect))
const isAssinaturaFlow = computed(() =>
  checkoutRedirect.value ? isOnboardingCheckoutPath(checkoutRedirect.value) : false,
)
const registerLink = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.REGISTER, checkoutRedirect.value),
)

onMounted(() => {
  const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)
  if (savedEmail) {
    email.value = savedEmail
    lembrarConta.value = true
  }
})

async function handleSubmit() {
  errorMessage.value = ''

  if (lembrarConta.value) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email.value)
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  }

  try {
    const captchaToken = captchaRef.value?.getToken()
    if (captchaEnabled && !captchaToken) {
      errorMessage.value = 'Marque o reCAPTCHA antes de continuar.'
      return
    }

    await login(
      { email: email.value, senha: senha.value, captchaToken },
      checkoutRedirect.value,
    )
    notificationsStore.push('success', 'Login realizado com sucesso!')
  } catch (err) {
    captchaResetNonce.value += 1
    if (resolveErrorCode(err) === 'EMAIL_NAO_CONFIRMADO') {
      notificationsStore.push('info', 'Confirme seu e-mail antes de entrar.')
      setStoredEmail(email.value.trim())
      await router.push({
        path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
        query: redirectQuery(checkoutRedirect.value),
      })
      return
    }
    errorMessage.value = resolveError(err, 'Não foi possível entrar.')
  }
}
</script>

<template>
  <section
    class="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6"
    :style="{ backgroundImage: `url(${loginBackground})` }"
  >
    <!-- Overlay escuro para contraste -->
    <div class="absolute inset-0 bg-gray-900/60" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-md flex-col items-center">
      <!-- Marca acima do card -->
      <RouterLink
        :to="ROUTE_PATHS.HOME"
        class="mb-6 flex items-center gap-3 text-white no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <img
          :src="loginCrest"
          alt=""
          class="h-10 w-10 shrink-0 object-contain"
        />
        <span class="font-satoshi text-2xl font-bold tracking-tight">Glow Up Connect</span>
      </RouterLink>

      <!-- Card de login -->
      <div class="w-full rounded-lg bg-white p-6 shadow-xl sm:p-8">
        <h1 class="mb-2 font-satoshi text-2xl font-bold leading-tight text-glow-text">
          Entre na sua conta
        </h1>
        <p class="mb-6 font-satoshi text-sm leading-snug text-glow-text-muted">
          {{
            isAssinaturaFlow
              ? 'Entre para cadastrar o estabelecimento e concluir a assinatura.'
              : 'Informe seu e-mail e senha para continuar.'
          }}
        </p>

        <p
          v-if="errorMessage"
          class="mb-5 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="mb-2 block font-satoshi text-sm font-medium text-glow-text">
              Seu e-mail
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="block h-11 w-full rounded-lg border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-sm text-glow-text placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
              placeholder="nome@empresa.com"
            />
          </div>

          <div>
            <label for="senha" class="mb-2 block font-satoshi text-sm font-medium text-glow-text">
              Senha
            </label>
            <input
              id="senha"
              v-model="senha"
              type="password"
              autocomplete="current-password"
              required
              class="block h-11 w-full rounded-lg border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-sm text-glow-text placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
              placeholder="••••••••"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <label class="group flex cursor-pointer select-none items-center gap-2.5">
              <input v-model="lembrarConta" type="checkbox" class="sr-only" />
              <span
                class="flex size-4 shrink-0 items-center justify-center rounded border border-glow-text/20 bg-white transition-all duration-200 group-has-[:checked]:border-glow-gold-dark group-has-[:checked]:bg-glow-gold-dark"
                aria-hidden="true"
              >
                <svg
                  class="h-2.5 w-2.5 text-white opacity-0 transition-all duration-200 group-has-[:checked]:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                  aria-hidden="true"
                >
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="font-satoshi text-sm text-glow-text-muted">Lembrar acesso</span>
            </label>

            <RouterLink
              :to="ROUTE_PATHS.FORGOT_PASSWORD"
              class="font-satoshi text-sm font-medium text-glow-gold-dark transition-colors duration-200 hover:text-glow-gold hover:underline"
            >
              Esqueceu a senha?
            </RouterLink>
          </div>

          <AuthRecaptcha ref="captchaRef" :reset-nonce="captchaResetNonce" />

          <button
            type="submit"
            :disabled="loading"
            class="flex h-11 w-full items-center justify-center rounded-lg bg-glow-gold-cta px-5 font-satoshi text-sm font-bold text-white shadow-[0_4px_14px_rgba(146,103,155,0.35)] transition-all duration-200 hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-glow-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="loading"
              class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
            Entrar na sua conta
          </button>

          <p class="text-center font-satoshi text-sm text-glow-text-muted">
            Ainda não possui uma conta?
            <RouterLink
              :to="registerLink"
              class="font-medium text-glow-gold-dark transition-colors duration-200 hover:underline"
            >
              Criar conta
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
