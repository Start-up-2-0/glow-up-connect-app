<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import OnboardingConfirmarDadosStep from '@/components/onboarding/OnboardingConfirmarDadosStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useAssinaturaLogadaWizard } from '@/composables/useAssinaturaLogadaWizard'

const route = useRoute()
const planoId = computed(() => Number(route.query.planoId))

const wizard = useAssinaturaLogadaWizard(planoId.value)

const {
  draft,
  step,
  stepperIndex,
  wizardSteps,
  plano,
  promocao,
  usaEstabelecimentoExistente,
  loading,
  submitting,
  aguardandoPagamento,
  pixQrCode,
  pixCheckoutUrl,
  erro,
  init,
  avancarParaConfirmacao,
  voltarDoConfirmar,
  avancarParaPagamento,
  voltarParaConfirmar,
  finalizarAssinatura,
} = wizard

const diasPermitidos = computed(
  () => promocao.value?.diasVencimentoPermitidos ?? [5, 10, 15, 20],
)

onMounted(() => {
  void init()
})
</script>

<template>
  <div class="mx-auto w-full" :class="step === 'assinatura' ? 'max-w-6xl' : 'max-w-3xl'">
    <div v-if="step !== 'assinatura'" class="mb-8">
      <h1 class="font-satoshi text-2xl font-bold text-glow-text lg:text-3xl">Contratar plano</h1>
      <p class="mt-2 text-glow-text-subtle">
        Complete as etapas para vincular o plano ao seu estabelecimento.
      </p>
    </div>

    <OnboardingStepper v-if="step !== 'assinatura'" :current="stepperIndex" :steps="wizardSteps" />

    <LoadingSpinner v-if="loading && !plano" />

    <template v-else-if="plano">
      <OnboardingEstabelecimentoStep
        v-if="step === 'estabelecimento'"
        :initial="draft.estabelecimento"
        :loading="loading"
        :error-message="erro"
        @submit="avancarParaConfirmacao"
      />

      <OnboardingConfirmarDadosStep
        v-else-if="step === 'confirmar'"
        :plano="plano"
        :estabelecimento="draft.estabelecimento"
        :estabelecimento-existente="usaEstabelecimentoExistente"
        :loading="loading"
        :error-message="erro"
        @back="voltarDoConfirmar"
        @submit="avancarParaPagamento"
      />

      <OnboardingPagamentoStep
        v-else
        :plano="plano"
        :promocao="promocao"
        :dias-permitidos="diasPermitidos"
        :submitting="submitting"
        :aguardando-pagamento="aguardandoPagamento"
        :pix-qr-code="pixQrCode"
        :pix-checkout-url="pixCheckoutUrl"
        :error-message="erro"
        @back="voltarParaConfirmar"
        @submit="finalizarAssinatura"
      />
    </template>
  </div>
</template>
