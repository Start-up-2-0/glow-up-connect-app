<script setup lang="ts">
import { ref } from 'vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  ONBOARDING_CONTRATAR_CARD_CLASS,
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
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
  back: []
}>()

const nome = ref(props.initial.nome)
const descricao = ref(props.initial.descricao)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const email = ref(props.initial.email)
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
    ...props.initial,
    nome: nome.value,
    descricao: descricao.value,
    telefone: telefoneToApi(telefone.value),
    email: email.value,
    logoDataUrl: logoDataUrl.value,
  })
}
</script>

<template>
  <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
    <p
      v-if="errorMessage || logoError"
      class="checkout-alert-error mb-6 px-4 py-3"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-info-nome" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Nome do estabelecimento</label>
        <input
          id="onb-info-nome"
          v-model="nome"
          type="text"
          required
          placeholder="Informe o nome do seu estabelecimento"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-info-descricao" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Descrição (opcional)</label>
        <input
          id="onb-info-descricao"
          v-model="descricao"
          type="text"
          placeholder="Breve apresentação do seu negócio"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <AuthAvatarUpload
        label="Logo do estabelecimento"
        variant="contratar"
        @change="onLogoChange"
        @error="(msg) => (logoError = msg)"
      />

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-info-email" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">E-mail comercial</label>
        <input
          id="onb-info-email"
          v-model="email"
          type="email"
          required
          placeholder="ex: usuario01@gmail.com"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <TelefoneInput
        id="onb-info-telefone"
        v-model="telefone"
        label="Telefone comercial"
        variant="contratar"
        required
        placeholder="(00) 0 0000-0000"
      />

      <OnboardingContratarFormActions :loading="loading" @back="emit('back')" />
    </form>
  </div>
</template>
