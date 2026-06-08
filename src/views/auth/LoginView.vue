<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import loginCrest from '@/assets/logo/logo.png'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
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
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LOGIN_CONTENT_CLASS,
  GLOW_LOGIN_PAGE_CLASS,
  GLOW_LINK_ACCENT_CLASS,
} from '@/constants/designTokens'

const REMEMBER_EMAIL_KEY = 'guc_remember_email'

const route = useRoute()
const router = useRouter()
const { login, loading } = useAuth()
const { setStoredEmail } = useConfirmEmail()
const { resolveError, resolveErrorCode } = useApiError()
const notificationsStore = useNotificationsStore()

const email = ref('')
const senha = ref('')
const lembrarConta = ref(false)
const mostrarSenha = ref(false)
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
    await login({ email: email.value, senha: senha.value }, checkoutRedirect.value)
    notificationsStore.push('success', 'Login realizado com sucesso!')
  } catch (err) {
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
  <div :class="GLOW_LOGIN_PAGE_CLASS">
    <div :class="GLOW_LOGIN_CONTENT_CLASS">
      <img
        :src="loginCrest"
        alt="Glow Up Connect"
        class="mb-[22px] h-[145px] w-[145px] shrink-0 object-contain"
        width="145"
        height="145"
      />

      <header class="mb-10 w-full">
        <h1 class="font-satoshi text-[32px] font-bold leading-normal text-glow-text">
          Bem-vindo ao Glow Up Connect
        </h1>
        <p class="mt-[5px] font-satoshi text-xl font-normal leading-normal text-glow-text-muted">
          {{
            isAssinaturaFlow
              ? 'Entre na sua conta para cadastrar o estabelecimento e concluir a assinatura.'
              : 'Acesse sua conta para gerenciar seus agendamentos.'
          }}
        </p>
      </header>

      <p
        v-if="errorMessage"
        class="mb-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/35 dark:text-red-300"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <form class="flex w-full flex-col gap-6" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <label for="email" class="font-satoshi text-sm font-normal text-glow-text">
            E-mail
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="relative flex flex-col gap-2">
          <label for="senha" class="font-satoshi text-sm font-normal text-glow-text">
            Senha
          </label>
          <input
            id="senha"
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            autocomplete="current-password"
            required
            :class="[GLOW_INPUT_CLASS, 'pr-12']"
          />
          <AuthPasswordToggle :pressed="mostrarSenha" @click="mostrarSenha = !mostrarSenha" />
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <label class="group flex cursor-pointer select-none items-center gap-2">
              <input v-model="lembrarConta" type="checkbox" class="sr-only" />
              <span
                class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border border-glow-text/20 bg-glow-hover-surface transition group-has-[:checked]:border-glow-gold group-has-[:checked]:bg-glow-gold"
                aria-hidden="true"
              >
                <svg
                  class="h-3 w-3 text-white opacity-0 transition group-has-[:checked]:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  aria-hidden="true"
                >
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="font-satoshi text-sm font-medium text-glow-text-soft">
                Lembrar minha conta
              </span>
            </label>

            <RouterLink :to="ROUTE_PATHS.FORGOT_PASSWORD" :class="GLOW_LINK_ACCENT_CLASS">
              Esqueceu a senha?
            </RouterLink>
          </div>

          <button
            type="submit"
            :disabled="loading"
            :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-satoshi text-xl font-medium text-white']"
          >
            <span
              v-if="loading"
              class="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
            Entrar na plataforma!
          </button>
        </div>
      </form>

      <p class="mt-[25px] w-full font-satoshi text-sm font-bold" :class="GLOW_LINK_ACCENT_CLASS">
        Não possui conta?
        <RouterLink :to="registerLink" class="hover:underline">Clique aqui.</RouterLink>
      </p>
    </div>
  </div>
</template>
