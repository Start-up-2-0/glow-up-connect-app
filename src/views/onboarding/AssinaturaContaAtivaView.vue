<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingInformacoesBasicasStep from '@/components/onboarding/OnboardingInformacoesBasicasStep.vue'
import OnboardingEnderecoStep from '@/components/onboarding/OnboardingEnderecoStep.vue'
import OnboardingConfirmarDadosStep from '@/components/onboarding/OnboardingConfirmarDadosStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useAssinaturaLogadaWizard } from '@/composables/useAssinaturaLogadaWizard'
import { ASSINATURA_LOGADA_STEP_SUBTITLES } from '@/types/assinaturaOnboarding.types'
import { ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const router = useRouter()
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
  avancarDeInformacoesBasicas,
  voltarDeEndereco,
  avancarDeEndereco,
  voltarDoConfirmar,
  editarEstabelecimento,
  avancarParaPagamento,
  voltarParaConfirmar,
  finalizarAssinatura,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')

const stepSubtitle = computed(() => ASSINATURA_LOGADA_STEP_SUBTITLES[step.value])

onMounted(() => {
  void init()
})

function onShellBack() {
  if (isCheckoutStep.value) {
    voltarParaConfirmar()
  }
}

function voltarDeInformacoesBasicas() {
  void router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
}
</script>

<template>
  <OnboardingAssinaturaShell
    variant="dashboard"
    :is-checkout-step="isCheckoutStep"
    :show-stepper="true"
    :stepper-index="stepperIndex"
    :steps="wizardSteps"
    :step-subtitle="isCheckoutStep ? '' : stepSubtitle"
    @back="onShellBack"
  >
    <template v-if="plano">
      <OnboardingInformacoesBasicasStep
        v-if="step === 'informacoes-basicas'"
        :initial="draft.estabelecimento"
        :loading="loading"
        :error-message="erro"
        @submit="avancarDeInformacoesBasicas"
        @back="voltarDeInformacoesBasicas"
      />

      <OnboardingEnderecoStep
        v-else-if="step === 'endereco'"
        :initial="draft.estabelecimento"
        :loading="submitting"
        :error-message="erro"
        @submit="avancarDeEndereco"
        @back="voltarDeEndereco"
      />

      <OnboardingConfirmarDadosStep
        v-else-if="step === 'confirmar'"
        :plano="plano"
        :estabelecimento="draft.estabelecimento"
        :estabelecimento-existente="usaEstabelecimentoExistente"
        :loading="loading"
        :error-message="erro"
        @back="voltarDoConfirmar"
        @edit="editarEstabelecimento"
        @submit="avancarParaPagamento"
      />

      <OnboardingPagamentoStep
        v-else
        variant="dashboard"
        :plano="plano"
        :promocao="promocao"
        :submitting="submitting"
        :aguardando-pagamento="aguardandoPagamento"
        :pix-qr-code="pixQrCode"
        :pix-checkout-url="pixCheckoutUrl"
        :error-message="erro"
        @back="voltarParaConfirmar"
        @submit="finalizarAssinatura"
      />
    </template>
  </OnboardingAssinaturaShell>
</template>
