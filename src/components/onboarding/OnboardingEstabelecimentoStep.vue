<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { readFileAsDataUrl } from '@/utils/avatarFile'
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
const telefone = ref(props.initial.telefone)
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
    telefone: telefone.value,
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
  <div>
    <header class="mb-6">
      <h2 class="font-satoshi text-2xl font-bold text-zinc-800">Cadastre seu estabelecimento</h2>
      <p class="mt-1 font-satoshi text-base text-zinc-800/50">
        Informe os dados do negócio que será vinculado à assinatura.
      </p>
    </header>

    <p
      v-if="errorMessage || logoError"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseInput v-model="nome" label="Nome do estabelecimento" required />
      <BaseInput
        v-model="descricao"
        label="Descrição"
        hint="Opcional — breve apresentação do negócio"
      />
      <AuthAvatarUpload label="Logo" @change="onLogoChange" @error="(msg) => (logoError = msg)" />
      <BaseInput v-model="telefone" label="Telefone comercial" required />
      <BaseInput v-model="email" label="E-mail comercial" type="email" required />
      <BaseInput v-model="cep" label="CEP" required />
      <BaseInput v-model="logradouro" label="Logradouro" required />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="numero" label="Número" required />
        <BaseInput v-model="bairro" label="Bairro" required />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="cidade" label="Cidade" required />
        <BaseInput v-model="estado" label="Estado" maxlength="2" required />
      </div>
      <BaseInput v-model="complemento" label="Complemento" hint="Opcional" />

      <BaseButton type="submit" variant="primary" block class="mt-2" :loading="loading">
        Continuar para assinatura
      </BaseButton>
    </form>
  </div>
</template>
