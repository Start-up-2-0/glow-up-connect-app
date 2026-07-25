<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import loginCrest from '@/assets/logo/logo_original.png'
import AuthSplashPanel from '@/components/auth/AuthSplashPanel.vue'
import AuthMobileBrand from '@/components/auth/AuthMobileBrand.vue'
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
  <div class="flex min-h-dvh flex-col bg-glow-bg-surface">
    <!-- Área principal: centraliza o container splash + card -->
    <div class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <!-- Container unificado — splash e card na mesma altura -->
      <div
        class="flex w-full max-w-[920px] flex-col rounded-[24px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] lg:flex-row lg:overflow-hidden"
      >
        <!-- Painel esquerdo — imagem lifestyle (lg+) -->
        <AuthSplashPanel />

        <!-- Painel direito — formulário -->
        <div class="flex w-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:w-[416px] lg:shrink-0">
          <!-- Marca mobile -->
          <div class="mb-6 text-center lg:hidden">
            <AuthMobileBrand />
          </div>

          <!-- Logo -->
          <div class="mb-6 flex justify-center">
            <img
              :src="loginCrest"
              alt="Glow Up Connect"
              class="h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24"
            />
          </div>

          <!-- Título -->
          <header class="mb-8 text-center">
            <h1 class="font-satoshi text-[26px] font-bold leading-tight text-glow-text sm:text-[28px]">
              Bem-vindo de volta 👋
            </h1>
            <p class="mt-1.5 font-satoshi text-base leading-snug text-glow-text-muted">
              {{
                isAssinaturaFlow
                  ? 'Entre para cadastrar o estabelecimento e concluir a assinatura.'
                  : 'Entre na sua conta para continuar.'
              }}
            </p>
          </header>

          <!-- Mensagem de erro -->
          <p
            v-if="errorMessage"
            class="mb-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <!-- Formulário -->
          <form class="flex w-full flex-col gap-[18px]" @submit.prevent="handleSubmit">
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label for="email" class="font-satoshi text-sm font-medium text-glow-text">E-mail</label>
              <div class="relative">
                <span
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-glow-text-muted"
                >
                  <svg class="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface pl-[42px] pr-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <!-- Senha -->
            <div class="flex flex-col gap-1.5">
              <label for="senha" class="font-satoshi text-sm font-medium text-glow-text">Senha</label>
              <div class="relative">
                <span
                  class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-glow-text-muted"
                >
                  <svg class="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <input
                  id="senha"
                  v-model="senha"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface pl-[42px] pr-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <!-- Lembrar acesso + Esqueceu senha -->
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <label class="group flex cursor-pointer select-none items-center gap-3 py-0.5">
                <input v-model="lembrarConta" type="checkbox" class="sr-only" />
                <span
                  class="flex size-[18px] shrink-0 items-center justify-center rounded border border-glow-text/20 bg-white transition-all duration-200 group-has-[:checked]:border-glow-gold-dark group-has-[:checked]:bg-glow-gold-dark"
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
                <span class="font-satoshi text-sm text-glow-text-soft">Lembrar acesso</span>
              </label>

              <RouterLink
                :to="ROUTE_PATHS.FORGOT_PASSWORD"
                class="text-sm font-medium text-glow-gold-dark transition-all duration-200 hover:text-glow-gold hover:underline"
              >
                Esqueceu a senha?
              </RouterLink>
            </div>

            <!-- reCAPTCHA -->
            <AuthRecaptcha ref="captchaRef" :reset-nonce="captchaResetNonce" />

            <!-- Botão principal -->
            <button
              type="submit"
              :disabled="loading"
              class="group flex h-[54px] w-full items-center justify-center rounded-[14px] bg-glow-gold-cta px-[10px] text-base font-bold text-white shadow-[0_4px_14px_rgba(146,103,155,0.35)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(146,103,155,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_rgba(146,103,155,0.35)]"
            >
              <span
                v-if="loading"
                class="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
              <span class="inline-flex items-center gap-2">
                Entrar
                <svg
                  class="size-[18px] transition-all duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </form>

          <!-- Login social -->
          <div class="mt-6">
            <div class="relative mb-4">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-glow-border-soft" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white px-4 font-satoshi text-sm text-glow-text-muted">
                  ou continue com
                </span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                disabled
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-glow-border-soft bg-white px-3 font-satoshi text-xs font-medium text-glow-text-muted transition-all duration-200 hover:bg-glow-bg-surface hover:border-glow-border-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg class="size-[18px] shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-glow-border-soft bg-white px-3 font-satoshi text-xs font-medium text-glow-text-muted transition-all duration-200 hover:bg-glow-bg-surface hover:border-glow-border-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg class="size-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
              <button
                type="button"
                disabled
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-glow-border-soft bg-white px-3 font-satoshi text-xs font-medium text-glow-text-muted transition-all duration-200 hover:bg-glow-bg-surface hover:border-glow-border-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg class="size-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 2C6.81 2 3 5.81 3 10.5c0 2.09.76 3.99 2.03 5.47l-1.4 1.4c-.39.39-.39 1.02 0 1.41.2.2.45.29.71.29.26 0 .51-.1.71-.29l1.4-1.4c1.48 1.27 3.38 2.03 5.47 2.03 4.69 0 8.5-3.81 8.5-8.5S16.19 2 11.5 2zm0 15c-3.58 0-6.5-2.92-6.5-6.5S7.92 4 11.5 4 18 6.92 18 10.5 15.08 17 11.5 17z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <!-- Cadastro CTA -->
          <p class="mt-6 text-center font-satoshi text-sm text-glow-text-muted">
            Ainda não possui uma conta?
            <RouterLink
              :to="registerLink"
              class="font-bold text-glow-gold-dark transition-all duration-200 hover:text-glow-gold hover:underline"
            >
              Criar conta gratuitamente
            </RouterLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer (lg+) -->
    <div class="hidden shrink-0 pb-4 text-center lg:block">
      <div class="flex items-center justify-center gap-6">
        <a
          href="#"
          class="font-satoshi text-xs text-glow-text-muted/45 transition-all duration-200 hover:text-glow-text-muted"
        >Termos</a>
        <span class="text-glow-text-muted/25">·</span>
        <a
          href="#"
          class="font-satoshi text-xs text-glow-text-muted/45 transition-all duration-200 hover:text-glow-text-muted"
        >Privacidade</a>
        <span class="text-glow-text-muted/25">·</span>
        <a
          href="#"
          class="font-satoshi text-xs text-glow-text-muted/45 transition-all duration-200 hover:text-glow-text-muted"
        >Contato</a>
        <span class="text-glow-text-muted/25">·</span>
        <span class="font-satoshi text-xs text-glow-text-muted/30">© 2026 Glow Up Connect</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-slide-up {
  animation: fade-slide-up 0.6s ease-out;
}
</style>
