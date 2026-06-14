<script setup lang="ts">
import { ref } from 'vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import { AGENDAR_BTN_CONTINUE_CLASS, GLOW_INPUT_CLASS, GLOW_LABEL_CLASS } from '@/constants/designTokens'
import type { OnboardingUsuarioDraft } from '@/types/onboardingAssinatura.types'
import { telefoneLocalFromApi } from '@/utils/formatters'

const props = defineProps<{
  initial: OnboardingUsuarioDraft
  loading?: boolean
  errorMessage?: string | null
  fieldErrors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  submit: [
    payload: {
      nome: string
      telefone: string
      email: string
      confirmarEmail: string
      senha: string
      confirmarSenha: string
      avatarBase64?: string
      avatarContentType?: string
    },
  ]
}>()

const nome = ref(props.initial.nome)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const email = ref(props.initial.email)
const confirmarEmail = ref(props.initial.email)
const senha = ref('')
const confirmarSenha = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)
const avatarFile = ref<File | null>(null)

const FIELD_KEYS = {
  nome: ['Nome', 'nome'],
  telefone: ['Telefone', 'telefone'],
  email: ['Email', 'email'],
  senha: ['Senha', 'senha'],
} as const

function getFieldError(...keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const messages = props.fieldErrors?.[key]
    if (messages?.length) return messages[0]
  }
  return undefined
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleSubmit() {
  const payload = {
    nome: nome.value,
    telefone: telefone.value,
    email: email.value,
    confirmarEmail: confirmarEmail.value,
    senha: senha.value,
    confirmarSenha: confirmarSenha.value,
  } as {
    nome: string
    telefone: string
    email: string
    confirmarEmail: string
    senha: string
    confirmarSenha: string
    avatarBase64?: string
    avatarContentType?: string
  }

  if (avatarFile.value) {
    payload.avatarBase64 = await readFileAsDataUrl(avatarFile.value)
    payload.avatarContentType = avatarFile.value.type
  }

  emit('submit', payload)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="agendar-section-title">Crie sua conta para assinar</h1>
      <p class="agendar-section-subtitle mt-2">
        Cadastre-se para configurar seu estabelecimento e contratar o plano escolhido.
      </p>
    </div>

    <p
      v-if="errorMessage"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div>
        <label for="onb-nome" :class="GLOW_LABEL_CLASS">Nome completo</label>
        <input
          id="onb-nome"
          v-model="nome"
          type="text"
          autocomplete="name"
          required
          placeholder="Informe seu nome completo"
          :class="[GLOW_INPUT_CLASS, 'mt-2']"
        />
        <p v-if="getFieldError(...FIELD_KEYS.nome)" class="mt-1 text-sm text-red-600">
          {{ getFieldError(...FIELD_KEYS.nome) }}
        </p>
      </div>

      <TelefoneInput
        id="onb-telefone"
        v-model="telefone"
        label="Telefone"
        variant="auth"
        autocomplete="tel"
        required
        placeholder="(00) 0 0000-0000"
        :error="getFieldError(...FIELD_KEYS.telefone)"
      />

      <div>
        <label for="onb-email" :class="GLOW_LABEL_CLASS">E-mail</label>
        <input
          id="onb-email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          placeholder="ex: usuario01@exemplo.com"
          :class="[GLOW_INPUT_CLASS, 'mt-2']"
        />
        <p v-if="getFieldError(...FIELD_KEYS.email)" class="mt-1 text-sm text-red-600">
          {{ getFieldError(...FIELD_KEYS.email) }}
        </p>
      </div>

      <div>
        <label for="onb-confirmar-email" :class="GLOW_LABEL_CLASS">Confirmar e-mail</label>
        <input
          id="onb-confirmar-email"
          v-model="confirmarEmail"
          type="email"
          autocomplete="email"
          required
          placeholder="ex: usuario01@exemplo.com"
          :class="[GLOW_INPUT_CLASS, 'mt-2']"
        />
      </div>

      <div class="relative">
        <label for="onb-senha" :class="GLOW_LABEL_CLASS">Senha</label>
        <input
          id="onb-senha"
          v-model="senha"
          :type="mostrarSenha ? 'text' : 'password'"
          autocomplete="new-password"
          required
          placeholder="Informe a sua senha"
          :class="[GLOW_INPUT_CLASS, 'mt-2 pr-12']"
        />
        <AuthPasswordToggle :pressed="mostrarSenha" @click="mostrarSenha = !mostrarSenha" />
        <p v-if="getFieldError(...FIELD_KEYS.senha)" class="mt-1 text-sm text-red-600">
          {{ getFieldError(...FIELD_KEYS.senha) }}
        </p>
      </div>

      <div class="relative">
        <label for="onb-confirmar-senha" :class="GLOW_LABEL_CLASS">Confirmar senha</label>
        <input
          id="onb-confirmar-senha"
          v-model="confirmarSenha"
          :type="mostrarConfirmarSenha ? 'text' : 'password'"
          autocomplete="new-password"
          required
          placeholder="Confirme a sua senha"
          :class="[GLOW_INPUT_CLASS, 'mt-2 pr-12']"
        />
        <AuthPasswordToggle
          :pressed="mostrarConfirmarSenha"
          @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
        />
      </div>

      <AuthAvatarUpload @change="(file) => (avatarFile = file)" @error="() => {}" />

      <button type="submit" :disabled="loading" :class="AGENDAR_BTN_CONTINUE_CLASS">
        <span
          v-if="loading"
          class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-glow-text border-t-transparent"
        />
        Continuar para confirmação
      </button>
    </form>
  </div>
</template>
