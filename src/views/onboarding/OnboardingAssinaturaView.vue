<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingUsuarioStep from '@/components/onboarding/OnboardingUsuarioStep.vue'
import OnboardingConfirmarEmailStep from '@/components/onboarding/OnboardingConfirmarEmailStep.vue'
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useOnboardingAssinaturaWizard } from '@/composables/useOnboardingAssinaturaWizard'
import { resolvePublicOnboardingStep } from '@/constants/onboardingWizardSteps'

const route = useRoute()
const planoId = computed(() => Number(route.query.planoId))

const wizard = useOnboardingAssinaturaWizard(planoId.value)

const {
  draft,
  step,
  plano,
  promocao,
  loading,
  submitting,
  aguardandoPagamento,
  pixQrCode,
  pixCheckoutUrl,
  erro,
  fieldErrors,
  captchaResetNonce,
  pendingAutoLogin,
  init,
  cadastrarConta,
  confirmarEmailCodigo,
  avancarParaAssinatura,
  voltarParaEstabelecimento,
  contratarPlano,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')

const publicStep = computed(() => resolvePublicOnboardingStep(step.value))

onMounted(() => {
  void init()
})

async function handleConfirmarEmail(codigo: string) {
  await confirmarEmailCodigo(codigo)
}

function handlePublicBack() {
  if (step.value === 'confirmar-email' && !draft.value.usuario.contaCriada) {
    step.value = 'conta'
    return
  }

  if (step.value === 'estabelecimento') {
    step.value = draft.value.usuario.emailConfirmado ? 'confirmar-email' : 'conta'
  }
}
</script>

<template>
  <OnboardingAssinaturaShell
    variant="public"
    :is-checkout-step="isCheckoutStep"
    :show-stepper="publicStep.showStepper"
    :public-step-index="publicStep.index"
    :public-step-label="publicStep.label"
    :public-show-back="publicStep.showBack"
    @back="handlePublicBack"
  >
    <template v-if="plano">
      <OnboardingUsuarioStep
        v-if="step === 'conta'"
        :initial="draft.usuario"
        :loading="loading"
        :error-message="erro"
        :field-errors="fieldErrors"
        :captcha-reset-nonce="captchaResetNonce"
        :continue-label="pendingAutoLogin ? 'Entrar e continuar' : 'Continuar para confirmação'"
        @submit="cadastrarConta"
      />

      <OnboardingEstabelecimentoStep
        v-else-if="step === 'estabelecimento'"
        variant="public"
        :initial="draft.estabelecimento"
        :loading="loading"
        :error-message="erro"
        @submit="avancarParaAssinatura"
      />

      <OnboardingPagamentoStep
        v-else-if="step === 'assinatura'"
        variant="public"
        :plano="plano"
        :promocao="promocao"
        :submitting="submitting"
        :aguardando-pagamento="aguardandoPagamento"
        :pix-qr-code="pixQrCode"
        :pix-checkout-url="pixCheckoutUrl"
        :error-message="erro"
        @back="voltarParaEstabelecimento"
        @submit="contratarPlano"
      />

      <OnboardingConfirmarEmailStep
        v-else
        :email="draft.usuario.email"
        :loading="loading"
        :error-message="erro"
        @confirm="handleConfirmarEmail"
      />
    </template>
  </OnboardingAssinaturaShell>
</template>
