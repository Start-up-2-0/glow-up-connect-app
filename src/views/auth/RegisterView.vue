<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AuthSplashPanel from '@/components/auth/AuthSplashPanel.vue'
import AuthMobileBrand from '@/components/auth/AuthMobileBrand.vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import { userService } from '@/services/userService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { ROUTE_PATHS } from '@/constants/routes'
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
import {
  GLOW_AUTH_PANEL_BORDERED_CLASS,
  GLOW_BODY_TEXT_CLASS,
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
  GLOW_LINK_ACCENT_CLASS,
} from '@/constants/designTokens'

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

const nome = ref('')
const telefone = ref('')
const email = ref('')
const confirmarEmail = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const avatarFile = ref<File | null>(null)
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)
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
    const payload = {
      nome: nome.value.trim(),
      email: email.value.trim(),
      telefone: telefone.value.trim(),
      senha: senha.value,
    } as {
      nome: string
      email: string
      telefone: string
      senha: string
      avatarBase64?: string
      avatarContentType?: string
    }

    if (avatarFile.value) {
      payload.avatarBase64 = await readFileAsDataUrl(avatarFile.value)
      payload.avatarContentType = avatarFile.value.type
    }

    const { data } = await userService.cadastrar(payload)
    notificationsStore.push('success', data.mensagem)
    setStoredEmail(email.value.trim())
    await router.push({
      path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
      query: redirectQuery(checkoutRedirect.value),
    })
  } catch (err) {
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
  <div class="relative flex min-h-screen bg-white">
    <AuthSplashPanel />

    <main :class="[GLOW_AUTH_PANEL_BORDERED_CLASS, 'overflow-y-auto']">
      <div class="my-auto w-full max-w-[494px] py-4">
        <AuthMobileBrand />

        <header class="mb-[13px]">
          <h1 class="font-satoshi text-3xl font-bold text-zinc-800">
            {{ isAssinaturaFlow ? 'Crie sua conta para assinar' : 'Bem-vindo ao Glow Up Connect' }}
          </h1>
          <p class="mt-[5px] font-satoshi text-xl font-normal text-zinc-800/40">
            {{
              isAssinaturaFlow
                ? 'Cadastre-se para configurar seu estabelecimento e contratar o plano escolhido.'
                : 'Insira seus dados corretamente para criar sua conta.'
            }}
          </p>
        </header>

        <p
          v-if="conviteResumo"
          class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {{ conviteResumo }}
        </p>

        <p
          v-if="errorMessage"
          class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ errorMessage }}
          <RouterLink
            v-if="emailJaCadastrado"
            :to="loginLink"
            :class="[GLOW_LINK_ACCENT_CLASS, 'ml-1 inline-block']"
          >
            Fazer login
          </RouterLink>
        </p>

        <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-2">
            <label for="nome" :class="GLOW_LABEL_CLASS">Nome completo</label>
            <input
              id="nome"
              v-model="nome"
              type="text"
              autocomplete="name"
              required
              placeholder="Informe seu nome completo"
              :class="GLOW_INPUT_CLASS"
            />
            <p v-if="getFieldError(...FIELD_KEYS.nome)" class="text-sm text-red-600">
              {{ getFieldError(...FIELD_KEYS.nome) }}
            </p>
          </div>

          <TelefoneInput
            id="telefone"
            v-model="telefone"
            label="Telefone"
            variant="auth"
            autocomplete="tel"
            required
            :error="getFieldError(...FIELD_KEYS.telefone)"
          />

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
            <div class="flex flex-col gap-2">
              <label for="email" :class="GLOW_LABEL_CLASS">E-mail</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="ex: usuario01@exemplo.com"
                :class="GLOW_INPUT_CLASS"
              />
              <p v-if="getFieldError(...FIELD_KEYS.email)" class="text-sm text-red-600">
                {{ getFieldError(...FIELD_KEYS.email) }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="confirmar-email" :class="GLOW_LABEL_CLASS">
                Confirmar E-mail
              </label>
              <input
                id="confirmar-email"
                v-model="confirmarEmail"
                type="email"
                autocomplete="email"
                required
                placeholder="ex: usuario01@exemplo.com"
                :class="GLOW_INPUT_CLASS"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
            <div class="relative flex flex-col gap-2">
              <label for="senha" :class="GLOW_LABEL_CLASS">Senha</label>
              <input
                id="senha"
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="Informe a sua senha"
                :class="[GLOW_INPUT_CLASS, 'pr-12']"
              />
              <AuthPasswordToggle
                :pressed="mostrarSenha"
                @click="mostrarSenha = !mostrarSenha"
              />
              <p v-if="getFieldError(...FIELD_KEYS.senha)" class="text-sm text-red-600">
                {{ getFieldError(...FIELD_KEYS.senha) }}
              </p>
            </div>
            <div class="relative flex flex-col gap-2">
              <label for="confirmar-senha" :class="GLOW_LABEL_CLASS">
                Confirmar Senha
              </label>
              <input
                id="confirmar-senha"
                v-model="confirmarSenha"
                :type="mostrarConfirmarSenha ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="Confirme a sua senha"
                :class="[GLOW_INPUT_CLASS, 'pr-12']"
              />
              <AuthPasswordToggle
                :pressed="mostrarConfirmarSenha"
                @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
              />
            </div>
          </div>

          <AuthAvatarUpload @change="onAvatarChange" @error="onAvatarError" />

          <div class="flex flex-col gap-4">
            <button
              type="submit"
              :disabled="loading"
              :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-satoshi text-xl font-medium text-white']"
            >
              <span
                v-if="loading"
                class="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
              Criar conta
            </button>

            <p :class="GLOW_BODY_TEXT_CLASS">
              Ao clicar em “Criar conta” você concorda com os nossos
              <button
                type="button"
                :class="GLOW_LINK_ACCENT_CLASS"
                @click="notificationsStore.push('info', 'Termos de uso em breve.')"
              >
                termos de uso
              </button>
            </p>

            <p :class="GLOW_BODY_TEXT_CLASS">
              Já possui conta?
              <RouterLink :to="loginLink" :class="GLOW_LINK_ACCENT_CLASS">
                Faça o login
              </RouterLink>
            </p>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
