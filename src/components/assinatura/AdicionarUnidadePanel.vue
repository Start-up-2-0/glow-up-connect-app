<script setup lang="ts">
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { EstabelecimentoOnboarding } from '@/types/assinatura.types'
import { draftEnderecoToApi } from '@/utils/enderecoPayload'

defineProps<{
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [estabelecimento: EstabelecimentoOnboarding]
  cancel: []
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
    endereco: draftEnderecoToApi(draft),
  })
}
</script>

<template>
  <OnboardingEstabelecimentoStep
    variant="contratar"
    embedded
    :initial="draftInicial"
    :loading="loading"
    :error-message="errorMessage"
    submit-label="Adicionar unidade"
    back-label="Cancelar"
    show-back
    @submit="handleSubmit"
    @back="emit('cancel')"
  />
</template>
