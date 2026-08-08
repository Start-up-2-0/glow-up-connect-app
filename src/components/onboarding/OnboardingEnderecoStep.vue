<script setup lang="ts">
import { ref } from 'vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import { ONBOARDING_CONTRATAR_CARD_CLASS, ONBOARDING_CONTRATAR_FORM_CLASS } from '@/constants/designTokens'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    modoAutonomo?: boolean
  }>(),
  {
    modoAutonomo: false,
  },
)

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
  back: []
}>()

const endereco = ref<EnderecoFormFields>({
  cep: props.initial.cep,
  logradouro: props.initial.logradouro,
  numero: props.initial.numero,
  bairro: props.initial.bairro,
  cidade: props.initial.cidade,
  estado: props.initial.estado,
  complemento: props.initial.complemento,
})

function handleSubmit() {
  emit('submit', {
    ...props.initial,
    ...endereco.value,
  })
}
</script>

<template>
  <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
    <p
      v-if="errorMessage"
      class="checkout-alert-error mb-6 px-4 py-3"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="modoAutonomo"
      class="mb-4 font-urbanist text-sm text-glow-text-muted"
    >
      Informe a localização de atendimento. Ela será usada na descoberta de profissionais e no mapa.
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <EnderecoForm
        v-model="endereco"
        variant="contratar"
        id-prefix="onb-end"
      />

      <OnboardingContratarFormActions :loading="loading" @back="emit('back')" />
    </form>
  </div>
</template>
