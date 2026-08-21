<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import loginCrest from '@/assets/logo/logo_original.webp'
import loginBackground from '@/assets/auth/login-background.webp'
import { useAuth } from '@/composables/useAuth'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { useCaptcha } from '@/composables/useCaptcha'
import AuthRecaptcha from '@/components/auth/AuthRecaptcha.vue'

const route = useRoute()
const { reativarConta, loading } = useAuth()
const { resolveError } = useApiError()
const notificationsStore = useNotificationsStore()
const captchaRef = ref<InstanceType<typeof AuthRecaptcha> | null>(null)
const captchaResetNonce = ref(0)
const { enabled: captchaEnabled } = useCaptcha()

const email = ref(typeof route.query.email === 'string' ? route.query.email.trim() : '')
const senha = ref('')
const errorMessage = ref('')

const reativarAte = computed(() => {
  const raw = route.query.reativarAte
  if (typeof raw !== 'string' || !raw.trim()) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const reativarAteLabel = computed(() => {
  if (!reativarAte.value) return null
  return reativarAte.value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

async function handleSubmit() {
  errorMessage.value = ''

  try {
    const captchaToken = captchaRef.value?.getToken()
    if (captchaEnabled && !captchaToken) {
      errorMessage.value = 'Marque o reCAPTCHA antes de continuar.'
      return
    }

    await reativarConta({
      email: email.value.trim(),
      senha: senha.value,
      captchaToken,
    })
    notificationsStore.push('success', 'Conta reativada com sucesso.')
  } catch (err) {
    captchaResetNonce.value += 1
    errorMessage.value = resolveError(err, 'Não foi possível reativar a conta.')
  }
}
</script>

<template>
  <section
    class="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6"
    :style="{ backgroundImage: `url(${loginBackground})` }"
  >
    <div class="absolute inset-0 bg-gray-900/60" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-md flex-col items-center">
      <RouterLink
        :to="ROUTE_PATHS.HOME"
        class="mb-6 flex items-center gap-3 text-white no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <img :src="loginCrest" alt="" class="h-10 w-10 shrink-0 object-contain" />
        <span class="font-satoshi text-2xl font-bold tracking-tight">Glow Up Connect</span>
      </RouterLink>

      <div class="w-full rounded-lg bg-white p-6 shadow-xl sm:p-8">
        <h1 class="mb-2 font-satoshi text-2xl font-bold leading-tight text-glow-text">
          Conta em exclusão
        </h1>
        <p class="mb-4 font-satoshi text-sm leading-snug text-glow-text-muted">
          Sua conta está marcada para exclusão.
          <template v-if="reativarAteLabel">
            Você pode reativá-la até <strong class="text-glow-text">{{ reativarAteLabel }}</strong>.
          </template>
          <template v-else>
            Você ainda pode reativá-la dentro do prazo de 30 dias.
          </template>
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
            Reativar conta
          </button>

          <p class="text-center font-satoshi text-sm text-glow-text-muted">
            <RouterLink
              :to="ROUTE_PATHS.LOGIN"
              class="font-medium text-glow-gold-dark transition-colors duration-200 hover:underline"
            >
              Voltar para o login
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
