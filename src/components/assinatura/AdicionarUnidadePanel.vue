<script setup lang="ts">
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { EstabelecimentoOnboarding } from '@/types/assinatura.types'

const props = defineProps<{
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [estabelecimento: EstabelecimentoOnboarding]
}>()

const draftInicial: OnboardingEstabelecimentoDraft = {
  nome: '',
  descricao: '',
  telefone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: '',
  logoDataUrl: null,
}

function handleSubmit(draft: OnboardingEstabelecimentoDraft) {
  if (!draft.logoDataUrl) return
  emit('submit', {
    nome: draft.nome,
    descricao: draft.descricao,
    logo: draft.logoDataUrl,
    telefone: draft.telefone,
    email: draft.email,
    endereco: {
      cep: draft.cep,
      logradouro: draft.logradouro,
      numero: draft.numero,
      complemento: draft.complemento,
      bairro: draft.bairro,
      cidade: draft.cidade,
      estado: draft.estado,
    },
  })
}
</script>

<template>
  <OnboardingEstabelecimentoStep
    variant="dashboard"
    :initial="draftInicial"
    :loading="loading"
    :error-message="errorMessage"
    @submit="handleSubmit"
  />
</template>
