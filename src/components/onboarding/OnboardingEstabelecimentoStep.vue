<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import {
  AGENDAR_BTN_CONTINUE_CLASS,
  GLOW_AUTH_FORM_GRID_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
} from '@/constants/designTokens'
import type { OnboardingUiVariant } from '@/constants/onboardingWizardSteps'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    variant?: OnboardingUiVariant
  }>(),
  {
    variant: 'public',
  },
)

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
}>()

const isPublic = computed(() => props.variant === 'public')
const fieldIdPrefix = computed(() => (isPublic.value ? 'onb-est' : 'onb-est-dash'))

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

const endereco = computed<EnderecoFormFields>({
  get: () => ({
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value,
  }),
  set: (value) => {
    cep.value = value.cep
    logradouro.value = value.logradouro
    numero.value = value.numero
    bairro.value = value.bairro
    cidade.value = value.cidade
    estado.value = value.estado
    complemento.value = value.complemento
  },
})
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
  <div :class="isPublic ? 'space-y-6' : ''">
    <header :class="isPublic ? '' : 'mb-6'">
      <h1 :class="isPublic ? 'agendar-section-title' : 'font-satoshi text-2xl font-bold text-glow-text'">
        Cadastre seu estabelecimento
      </h1>
      <p
        :class="
          isPublic
            ? 'agendar-section-subtitle mt-2'
            : 'mt-1 text-sm text-glow-text-subtle'
        "
      >
        Informe os dados do negócio que será vinculado à assinatura.
      </p>
    </header>

    <p
      v-if="errorMessage || logoError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form class="flex w-full flex-col gap-6" @submit.prevent="handleSubmit">
      <div :class="GLOW_AUTH_FORM_GRID_CLASS">
        <div class="flex flex-col gap-2 sm:col-span-2">
          <label :for="`${fieldIdPrefix}-nome`" :class="GLOW_LABEL_CLASS">Nome do estabelecimento</label>
          <input
            :id="`${fieldIdPrefix}-nome`"
            v-model="nome"
            type="text"
            required
            placeholder="Nome do seu negócio"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <label :for="`${fieldIdPrefix}-descricao`" :class="GLOW_LABEL_CLASS">Descrição</label>
          <input
            :id="`${fieldIdPrefix}-descricao`"
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
          :id="`${fieldIdPrefix}-telefone`"
          v-model="telefone"
          label="Telefone comercial"
          variant="auth"
          required
          placeholder="(00) 0 0000-0000"
        />

        <div class="flex flex-col gap-2">
          <label :for="`${fieldIdPrefix}-email`" :class="GLOW_LABEL_CLASS">E-mail comercial</label>
          <input
            :id="`${fieldIdPrefix}-email`"
            v-model="email"
            type="email"
            required
            placeholder="contato@seunegocio.com"
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <EnderecoForm
          v-model="endereco"
          :variant="isPublic ? 'auth' : 'dashboard'"
          :id-prefix="`${fieldIdPrefix}-end`"
          grid-class="contents"
        />
      </div>

      <button
        v-if="isPublic"
        type="submit"
        :disabled="loading"
        :class="AGENDAR_BTN_CONTINUE_CLASS"
      >
        <span
          v-if="loading"
          class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-glow-text border-t-transparent"
        />
        Continuar para assinatura
      </button>

      <BaseButton v-else type="submit" variant="primary" block :loading="loading">
        Continuar para assinatura
      </BaseButton>
    </form>
  </div>
</template>
