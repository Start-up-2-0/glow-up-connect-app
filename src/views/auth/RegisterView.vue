<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import registerCrest from '@/assets/logo/logo_original.png'
import loginBackground from '@/assets/auth/login-background.webp'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
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
const sexo = ref<'' | 'Masculino' | 'Feminino'>('')
const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
]
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

const inputClass =
  'block h-11 w-full rounded-lg border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-sm text-glow-text placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20'

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
      sexo?: 'Masculino' | 'Feminino'
      avatarBase64?: string
      avatarContentType?: string
      captchaToken?: string
    } = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefoneToApi(telefone.value),
      senha: senha.value,
      sexo: sexo.value || undefined,
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
  <section
    class="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6"
    :style="{ backgroundImage: `url(${loginBackground})` }"
  >
    <!-- Overlay escuro para contraste -->
    <div class="absolute inset-0 bg-gray-900/60" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-xl flex-col items-center">
      <!-- Marca acima do card -->
      <RouterLink
        :to="ROUTE_PATHS.HOME"
        class="mb-6 flex items-center gap-3 text-white no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <img
          :src="registerCrest"
          alt=""
          class="h-10 w-10 shrink-0 object-contain"
        />
        <span class="font-satoshi text-2xl font-bold tracking-tight">Glow Up Connect</span>
      </RouterLink>

      <!-- Card de cadastro -->
      <div class="w-full rounded-lg bg-white p-6 shadow-xl sm:p-8">
        <h1 class="mb-2 font-satoshi text-2xl font-bold leading-tight text-glow-text">
          {{ isAssinaturaFlow ? 'Crie sua conta para assinar' : 'Crie a sua conta' }}
        </h1>
        <p class="mb-6 font-satoshi text-sm leading-snug text-glow-text-muted">
          {{
            isAssinaturaFlow
              ? 'Cadastre-se para configurar seu estabelecimento e contratar o plano escolhido.'
              : 'Preencha seus dados para criar sua conta.'
          }}
        </p>

        <p
          v-if="conviteResumo"
          class="mb-5 w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {{ conviteResumo }}
        </p>

        <p
          v-if="errorMessage"
          class="mb-5 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ errorMessage }}
          <RouterLink
            v-if="emailJaCadastrado"
            :to="loginLink"
            class="ml-1 inline-block font-medium text-glow-gold-dark hover:underline"
          >
            Fazer login
          </RouterLink>
        </p>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-4">
            <div class="sm:col-span-2">
              <label for="nome" class="mb-2 block font-satoshi text-sm font-medium text-glow-text">
                Nome completo
              </label>
              <input
                id="nome"
                v-model="nome"
                type="text"
                autocomplete="name"
                required
                placeholder="Informe seu nome completo"
                :class="inputClass"
              />
              <p v-if="getFieldError(...FIELD_KEYS.nome)" class="mt-1.5 text-sm text-red-600">
                {{ getFieldError(...FIELD_KEYS.nome) }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <span class="mb-2 block font-satoshi text-sm font-medium text-glow-text">Sexo</span>
              <SegmentedControl v-model="sexo" :options="SEXO_OPTIONS" aria-label="Sexo" />
            </div>

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

            <div>
              <label for="email" class="mb-2 block font-satoshi text-sm font-medium text-glow-text">
                E-mail
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="nome@empresa.com"
                :class="inputClass"
              />
              <p v-if="getFieldError(...FIELD_KEYS.email)" class="mt-1.5 text-sm text-red-600">
                {{ getFieldError(...FIELD_KEYS.email) }}
              </p>
            </div>

            <div>
              <label
                for="confirmar-email"
                class="mb-2 block font-satoshi text-sm font-medium text-glow-text"
              >
                Confirmar e-mail
              </label>
              <input
                id="confirmar-email"
                v-model="confirmarEmail"
                type="email"
                autocomplete="email"
                required
                placeholder="nome@empresa.com"
                :class="inputClass"
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
                autocomplete="new-password"
                required
                placeholder="••••••••"
                :class="inputClass"
              />
              <p v-if="getFieldError(...FIELD_KEYS.senha)" class="mt-1.5 text-sm text-red-600">
                {{ getFieldError(...FIELD_KEYS.senha) }}
              </p>
            </div>

            <div>
              <label
                for="confirmar-senha"
                class="mb-2 block font-satoshi text-sm font-medium text-glow-text"
              >
                Confirmar senha
              </label>
              <input
                id="confirmar-senha"
                v-model="confirmarSenha"
                type="password"
                autocomplete="new-password"
                required
                placeholder="••••••••"
                :class="inputClass"
              />
            </div>

            <div class="sm:col-span-2">
              <AuthAvatarUpload @change="onAvatarChange" @error="onAvatarError" />
            </div>
          </div>

          <label class="group flex cursor-pointer items-start gap-2.5">
            <input v-model="aceitoTermos" type="checkbox" class="sr-only" />
            <span
              class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-glow-text/20 bg-white transition-all duration-200 group-has-[:checked]:border-glow-gold-dark group-has-[:checked]:bg-glow-gold-dark"
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
            <span class="font-satoshi text-sm text-glow-text-muted">
              Li e aceito os
              <a
                :href="legalUrl('termos-de-uso')"
                target="_blank"
                rel="noopener"
                class="font-medium text-glow-gold-dark transition-colors duration-200 hover:underline"
              >
                termos de uso
              </a>
              e a
              <a
                :href="legalUrl('politica-de-cookies')"
                target="_blank"
                rel="noopener"
                class="font-medium text-glow-gold-dark transition-colors duration-200 hover:underline"
              >
                política de cookies
              </a>.
            </span>
          </label>

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
            Criar conta
          </button>

          <p class="text-center font-satoshi text-sm text-glow-text-muted">
            Já possui uma conta?
            <RouterLink
              :to="loginLink"
              class="font-medium text-glow-gold-dark transition-colors duration-200 hover:underline"
            >
              Faça o login
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
