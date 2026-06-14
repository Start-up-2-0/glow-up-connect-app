<script setup lang="ts">
import { ref } from 'vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import {
  GLOW_AUTH_FORM_GRID_CLASS,
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
} from '@/constants/designTokens'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = defineProps<{
  initial: OnboardingEstabelecimentoDraft
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
}>()

const nome = ref(props.initial.nome)
const descricao = ref(props.initial.descricao)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const email = ref(props.initial.email)
const cep = ref(props.initial.cep)
const logradouro = ref(props.initial.logradouro)
const numero = ref(props.initial.numero)
const bairro = ref(props.initial.bairro)
const cidade = ref(props.initial.cidade)
const estado = ref(props.initial.estado)
const complemento = ref(props.initial.complemento)
const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)

async function onLogoChange(file: File | null) {
  logoError.value = null
  if (!file) {
    logoDataUrl.value = null
    return
  }
  try {
    logoDataUrl.value = await readFileAsDataUrl(file)
  } catch {
    logoError.value = 'Não foi possível carregar a logo.'
  }
}

function handleSubmit() {
  emit('submit', {
    nome: nome.value,
    descricao: descricao.value,
    telefone: telefoneToApi(telefone.value),
    email: email.value,
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value,
    logoDataUrl: logoDataUrl.value,
  })
}
</script>

<template>
  <div class="w-full">
    <header class="mb-10 w-full text-center">
      <h1 class="font-satoshi text-[32px] font-bold leading-normal text-glow-text">
        Cadastre seu estabelecimento
      </h1>
      <p class="mt-[5px] font-satoshi text-xl font-normal leading-normal text-glow-text-muted">
        Informe os dados do negócio que será vinculado à assinatura.
      </p>
    </header>

    <p
      v-if="errorMessage || logoError"
      class="mb-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form class="flex w-full flex-col gap-6" @submit.prevent="handleSubmit">
      <div :class="GLOW_AUTH_FORM_GRID_CLASS">
        <div class="flex flex-col gap-2 sm:col-span-2">
          <label for="onb-est-nome" :class="GLOW_LABEL_CLASS">Nome do estabelecimento</label>
          <input
            id="onb-est-nome"
            v-model="nome"
            type="text"
            required
            placeholder="Nome do seu negócio"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <label for="onb-est-descricao" :class="GLOW_LABEL_CLASS">Descrição</label>
          <input
            id="onb-est-descricao"
            v-model="descricao"
            type="text"
            placeholder="Opcional — breve apresentação do negócio"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="sm:col-span-2">
          <AuthAvatarUpload label="Logo" @change="onLogoChange" @error="(msg) => (logoError = msg)" />
        </div>

        <TelefoneInput
          id="onb-est-telefone"
          v-model="telefone"
          label="Telefone comercial"
          variant="auth"
          required
          placeholder="(00) 0 0000-0000"
        />

        <div class="flex flex-col gap-2">
          <label for="onb-est-email" :class="GLOW_LABEL_CLASS">E-mail comercial</label>
          <input
            id="onb-est-email"
            v-model="email"
            type="email"
            required
            placeholder="contato@seunegocio.com"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-est-cep" :class="GLOW_LABEL_CLASS">CEP</label>
          <input
            id="onb-est-cep"
            v-model="cep"
            type="text"
            required
            placeholder="00000-000"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <label for="onb-est-logradouro" :class="GLOW_LABEL_CLASS">Logradouro</label>
          <input
            id="onb-est-logradouro"
            v-model="logradouro"
            type="text"
            required
            placeholder="Rua, avenida..."
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-est-numero" :class="GLOW_LABEL_CLASS">Número</label>
          <input
            id="onb-est-numero"
            v-model="numero"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-est-bairro" :class="GLOW_LABEL_CLASS">Bairro</label>
          <input
            id="onb-est-bairro"
            v-model="bairro"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-est-cidade" :class="GLOW_LABEL_CLASS">Cidade</label>
          <input
            id="onb-est-cidade"
            v-model="cidade"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-est-estado" :class="GLOW_LABEL_CLASS">Estado</label>
          <input
            id="onb-est-estado"
            v-model="estado"
            type="text"
            maxlength="2"
            required
            placeholder="UF"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <label for="onb-est-complemento" :class="GLOW_LABEL_CLASS">Complemento</label>
          <input
            id="onb-est-complemento"
            v-model="complemento"
            type="text"
            placeholder="Opcional"
            :class="GLOW_INPUT_CLASS"
          />
        </div>
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
        Continuar para assinatura
      </button>
    </form>
  </div>
</template>
