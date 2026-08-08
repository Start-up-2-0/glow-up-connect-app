<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingInformacoesBasicasStep from '@/components/onboarding/OnboardingInformacoesBasicasStep.vue'
import OnboardingEnderecoStep from '@/components/onboarding/OnboardingEnderecoStep.vue'
import OnboardingConfirmarDadosStep from '@/components/onboarding/OnboardingConfirmarDadosStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useAssinaturaLogadaWizard } from '@/composables/useAssinaturaLogadaWizard'
import {
  ASSINATURA_LOGADA_STEP_SUBTITLES,
  ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO,
} from '@/types/assinaturaOnboarding.types'
import { ROUTE_PATHS } from '@/constants/routes'
import type { TipoAssinatura } from '@/types/assinatura.types'

const route = useRoute()
const router = useRouter()
const planoId = computed(() => Number(route.query.planoId))
const tipoAssinatura = computed<TipoAssinatura>(() =>
  route.query.tipoAssinatura === 'ProfissionalAutonomo'
    ? 'ProfissionalAutonomo'
    : 'Estabelecimento',
)

const wizard = useAssinaturaLogadaWizard(planoId.value, tipoAssinatura.value)

const {
  draft,
  step,
  stepperIndex,
  wizardSteps,
  plano,
  promocao,
  usaEstabelecimentoExistente,
  ehAutonomo,
  avatarContaDisponivel,
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

const stepSubtitle = computed(() =>
  ehAutonomo.value
    ? ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO[step.value]
    : ASSINATURA_LOGADA_STEP_SUBTITLES[step.value],
)

const usarDadosContaPadrao = computed(() => {
  if (!ehAutonomo.value) return false
  const e = draft.value.estabelecimento
  return Boolean(e.nome.trim() || e.email.trim() || e.telefone.trim())
})

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
    :modo-autonomo="ehAutonomo"
    @back="onShellBack"
  >
    <template v-if="plano">
      <OnboardingInformacoesBasicasStep
        v-if="step === 'informacoes-basicas'"
        :initial="draft.estabelecimento"
        :modo-autonomo="ehAutonomo"
        :usar-dados-conta-padrao="usarDadosContaPadrao"
        :avatar-conta-disponivel="avatarContaDisponivel"
        :loading="loading"
        :error-message="erro"
        @submit="avancarDeInformacoesBasicas"
        @back="voltarDeInformacoesBasicas"
      />

      <OnboardingEnderecoStep
        v-else-if="step === 'endereco'"
        :initial="draft.estabelecimento"
        :modo-autonomo="ehAutonomo"
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
        :modo-autonomo="ehAutonomo"
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
