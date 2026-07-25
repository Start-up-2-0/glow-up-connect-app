<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import registerCrest from '@/assets/logo/logo_original.png'
import AuthSplashPanel from '@/components/auth/AuthSplashPanel.vue'
import AuthMobileBrand from '@/components/auth/AuthMobileBrand.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import { userService } from '@/services/userService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { ROUTE_PATHS } from '@/constants/routes'
import { legalUrl } from '@/utils/landingUrl'
import { telefoneToApi } from '@/utils/formatters'
import {
  authRouteWithRedirect,
  extractConviteTokenFromPath,
  isConviteResponderPath,
  isOnboardingCheckoutPath,
  readRedirectParam,
  redirectQuery,
} from '@/utils/authRedirect'
import { conviteService } from '@/services/conviteService'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { useConsent } from '@/composables/useConsent'
import { useCaptcha } from '@/composables/useCaptcha'
import AuthRecaptcha from '@/components/auth/AuthRecaptcha.vue'

const route = useRoute()
const router = useRouter()
const checkoutRedirect = computed(() => readRedirectParam(route.query.redirect))
const isAssinaturaFlow = computed(() =>
  checkoutRedirect.value ? isOnboardingCheckoutPath(checkoutRedirect.value) : false,
)
const loginLink = computed(() => authRouteWithRedirect(ROUTE_PATHS.LOGIN, checkoutRedirect.value))
const { setStoredEmail } = useConfirmEmail()
const { resolveError, resolveErrorCode, resolveFieldErrors } = useApiError()
const notificationsStore = useNotificationsStore()
const { acceptTerms } = useConsent()
const captchaRef = ref<InstanceType<typeof AuthRecaptcha> | null>(null)
const captchaResetNonce = ref(0)
const { enabled: captchaEnabled } = useCaptcha()

const aceitoTermos = ref(false)

const nome = ref('')
const telefone = ref('')
const email = ref('')
const confirmarEmail = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const avatarFile = ref<File | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string[]>>({})
const emailJaCadastrado = ref(false)
const conviteResumo = ref<string | null>(null)

onMounted(async () => {
  const redirect = checkoutRedirect.value
  if (!redirect || !isConviteResponderPath(redirect)) return

  const token = extractConviteTokenFromPath(redirect)
  if (!token) return

  try {
    const preview = await conviteService.obterPreview(token)
    email.value = preview.email
    confirmarEmail.value = preview.email
    conviteResumo.value = `Convite para ${establishmentRoleLabel(preview.roleSugerida)} em ${preview.nomeEstabelecimento}. Use este e-mail no cadastro.`
  } catch {
    /* cadastro segue sem pré-preenchimento */
  }
})

const FIELD_KEYS = {
  nome: ['Nome', 'nome'],
  telefone: ['Telefone', 'telefone'],
  email: ['Email', 'email'],
  senha: ['Senha', 'senha'],
} as const

function getFieldError(...keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const messages = fieldErrors.value[key]
    if (messages?.length) return messages[0]
  }
  return undefined
}

function applyFieldErrors(errors: Record<string, string[]>) {
  fieldErrors.value = errors
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function validateForm(): boolean {
  if (!aceitoTermos.value) {
    errorMessage.value = 'Você precisa aceitar os termos de uso para criar a conta.'
    return false
  }
  if (email.value.trim() !== confirmarEmail.value.trim()) {
    errorMessage.value = 'Os e-mails informados não coincidem.'
    return false
  }
  if (senha.value !== confirmarSenha.value) {
    errorMessage.value = 'As senhas informadas não coincidem.'
    return false
  }
  return true
}

async function handleSubmit() {
  errorMessage.value = ''
  fieldErrors.value = {}
  emailJaCadastrado.value = false
  if (!validateForm()) return

  loading.value = true
  try {
    const payload: {
      nome: string
      email: string
      telefone: string
      senha: string
      avatarBase64?: string
      avatarContentType?: string
      captchaToken?: string
    } = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefoneToApi(telefone.value),
      senha: senha.value,
    }

    if (avatarFile.value) {
      payload.avatarBase64 = await readFileAsDataUrl(avatarFile.value)
      payload.avatarContentType = avatarFile.value.type
    }

    payload.captchaToken = captchaRef.value?.getToken()
    if (captchaEnabled && !payload.captchaToken) {
      errorMessage.value = 'Marque o reCAPTCHA antes de continuar.'
      return
    }

    const { data } = await userService.cadastrar(payload)
    acceptTerms()
    notificationsStore.push('success', data.mensagem)
    setStoredEmail(email.value.trim())
    await router.push({
      path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
      query: redirectQuery(checkoutRedirect.value),
    })
  } catch (err) {
    captchaResetNonce.value += 1
    if (resolveErrorCode(err) === 'EMAIL_JA_CADASTRADO') {
      emailJaCadastrado.value = true
    }
    applyFieldErrors(resolveFieldErrors(err))
    errorMessage.value = resolveError(err, 'Não foi possível cadastrar.')
  } finally {
    loading.value = false
  }
}

function onAvatarChange(file: File | null) {
  avatarFile.value = file
}

function onAvatarError(message: string) {
  errorMessage.value = message
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-glow-bg-surface">
    <!-- Área principal: centraliza o container splash + card -->
    <div class="flex flex-1 items-start justify-center overflow-y-auto px-4 py-8 sm:px-6">
      <!-- Container unificado — splash e card na mesma altura -->
      <div
        class="flex w-full max-w-[1000px] flex-col rounded-[24px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.08)] lg:flex-row lg:overflow-hidden"
      >
        <!-- Painel esquerdo — imagem lifestyle (lg+) -->
        <AuthSplashPanel />

        <!-- Painel direito — formulário -->
        <div class="flex w-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:w-[500px] lg:shrink-0">
          <!-- Marca mobile -->
          <div class="mb-6 text-center lg:hidden">
            <AuthMobileBrand />
          </div>

          <!-- Logo -->
          <div class="mb-6 flex justify-center">
            <img
              :src="registerCrest"
              alt="Glow Up Connect"
              class="h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24"
            />
          </div>

          <!-- Título -->
          <header class="mb-8 text-center">
            <h1 class="font-satoshi text-[26px] font-bold leading-tight text-glow-text sm:text-[28px]">
              {{ isAssinaturaFlow ? 'Crie sua conta para assinar' : 'Crie agora a sua conta!' }}
            </h1>
            <p class="mt-1.5 font-satoshi text-base leading-snug text-glow-text-muted">
              {{
                isAssinaturaFlow
                  ? 'Cadastre-se para configurar seu estabelecimento e contratar o plano escolhido.'
                  : 'Preencha seus dados para criar sua conta.'
              }}
            </p>
          </header>

          <!-- Convite resumo -->
          <p
            v-if="conviteResumo"
            class="mb-5 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            {{ conviteResumo }}
          </p>

          <!-- Mensagem de erro -->
          <p
            v-if="errorMessage"
            class="mb-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ errorMessage }}
            <RouterLink v-if="emailJaCadastrado" :to="loginLink" class="ml-1 inline-block font-bold text-glow-gold-dark hover:underline">
              Fazer login
            </RouterLink>
          </p>

          <!-- Formulário -->
          <form class="flex w-full flex-col gap-[18px]" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-3">
              <!-- Nome -->
              <div class="flex flex-col gap-1.5">
                <label for="nome" class="font-satoshi text-sm font-medium text-glow-text">
                  Nome completo
                </label>
                <input
                  id="nome"
                  v-model="nome"
                  type="text"
                  autocomplete="name"
                  required
                  placeholder="Informe seu nome completo"
                  class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                />
                <p v-if="getFieldError(...FIELD_KEYS.nome)" class="text-sm text-red-600">
                  {{ getFieldError(...FIELD_KEYS.nome) }}
                </p>
              </div>

              <!-- Telefone -->
              <TelefoneInput
                id="telefone"
                v-model="telefone"
                label="Telefone"
                variant="auth"
                autocomplete="tel"
                required
                placeholder="(00) 0 0000-0000"
                :error="getFieldError(...FIELD_KEYS.telefone)"
              />

              <!-- Email -->
              <div class="flex flex-col gap-1.5">
                <label for="email" class="font-satoshi text-sm font-medium text-glow-text">
                  E-mail
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="ex: usuario01@exemplo.com"
                  class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                />
                <p v-if="getFieldError(...FIELD_KEYS.email)" class="text-sm text-red-600">
                  {{ getFieldError(...FIELD_KEYS.email) }}
                </p>
              </div>

              <!-- Confirmar Email -->
              <div class="flex flex-col gap-1.5">
                <label for="confirmar-email" class="font-satoshi text-sm font-medium text-glow-text">
                  Confirmar E-mail
                </label>
                <input
                  id="confirmar-email"
                  v-model="confirmarEmail"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="ex: usuario01@exemplo.com"
                  class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                />
              </div>

              <!-- Senha -->
              <div class="flex flex-col gap-1.5">
                <label for="senha" class="font-satoshi text-sm font-medium text-glow-text">
                  Senha
                </label>
                <div class="relative">
                  <input
                    id="senha"
                    v-model="senha"
                    type="password"
                    autocomplete="new-password"
                    required
                    placeholder="Informe a sua senha"
                    class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface pl-4 pr-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                  />
                </div>
                <p v-if="getFieldError(...FIELD_KEYS.senha)" class="text-sm text-red-600">
                  {{ getFieldError(...FIELD_KEYS.senha) }}
                </p>
              </div>

              <!-- Confirmar Senha -->
              <div class="flex flex-col gap-1.5">
                <label for="confirmar-senha" class="font-satoshi text-sm font-medium text-glow-text">
                  Confirmar Senha
                </label>
                <div class="relative">
                  <input
                    id="confirmar-senha"
                    v-model="confirmarSenha"
                    type="password"
                    autocomplete="new-password"
                    required
                    placeholder="Confirme a sua senha"
                    class="h-[54px] w-full rounded-xl border border-glow-border-soft bg-glow-bg-surface pl-4 pr-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20"
                  />
                </div>
              </div>

              <!-- Avatar -->
              <div class="sm:col-span-2">
                <AuthAvatarUpload @change="onAvatarChange" @error="onAvatarError" />
              </div>
            </div>

            <!-- Termos -->
            <label class="group flex min-h-11 cursor-pointer items-start gap-3 py-1">
              <input v-model="aceitoTermos" type="checkbox" class="sr-only" />
              <span
                class="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded border border-glow-text/20 bg-white transition-all duration-200 group-has-[:checked]:border-glow-gold-dark group-has-[:checked]:bg-glow-gold-dark"
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
              <span class="font-satoshi text-sm text-glow-text">
                Li e aceito os
                <a
                  :href="legalUrl('termos-de-uso')"
                  target="_blank"
                  rel="noopener"
                  class="font-bold text-glow-gold-dark transition-all duration-200 hover:text-glow-gold hover:underline"
                >
                  termos de uso
                </a>
                e a
                <a
                  :href="legalUrl('politica-de-cookies')"
                  target="_blank"
                  rel="noopener"
                  class="font-bold text-glow-gold-dark transition-all duration-200 hover:text-glow-gold hover:underline"
                >
                  política de cookies
                </a>.
              </span>
            </label>

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
                Criar conta
              </span>
            </button>

            <!-- Login link -->
            <p class="text-center font-satoshi text-sm text-glow-text-muted">
              Já possui conta?
              <RouterLink
                :to="loginLink"
                class="font-bold text-glow-gold-dark transition-all duration-200 hover:text-glow-gold hover:underline"
              >
                Faça o login
              </RouterLink>
            </p>
          </form>
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
