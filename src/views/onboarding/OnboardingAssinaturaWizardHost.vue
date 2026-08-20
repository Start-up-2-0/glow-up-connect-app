<script setup lang="ts">
import { computed, onMounted } from 'vue'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingUsuarioStep from '@/components/onboarding/OnboardingUsuarioStep.vue'
import OnboardingConfirmarEmailStep from '@/components/onboarding/OnboardingConfirmarEmailStep.vue'
import OnboardingConfirmarWhatsAppStep from '@/components/onboarding/OnboardingConfirmarWhatsAppStep.vue'
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useOnboardingAssinaturaWizard } from '@/composables/useOnboardingAssinaturaWizard'
import { resolvePublicOnboardingStep } from '@/constants/onboardingWizardSteps'
import type { TipoAssinatura } from '@/types/assinatura.types'

const props = defineProps<{
  planoId: number
  tipoAssinatura: TipoAssinatura
}>()

const wizard = useOnboardingAssinaturaWizard(props.planoId, props.tipoAssinatura)

const {
  draft,
  step,
  plano,
  promocao,
  ehAutonomo,
  loading,
  submitting,
  aguardandoPagamento,
  pixQrCode,
  pixCheckoutUrl,
  erro,
  fieldErrors,
  captchaResetNonce,
  pendingAutoLogin,
  whatsappInstrucoes,
  resendingWhatsApp,
  init,
  cadastrarConta,
  confirmarEmailCodigo,
  verificarWhatsApp,
  reenviarWhatsApp,
  avancarParaAssinatura,
  voltarParaEstabelecimento,
  contratarPlano,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')

const publicStep = computed(() => {
  const base = resolvePublicOnboardingStep(step.value)
  if (step.value === 'estabelecimento' && ehAutonomo.value) {
    return { ...base, label: 'Perfil profissional' }
  }
  return base
})

onMounted(() => {
  void init()
})

async function handleConfirmarEmail(codigo: string) {
  await confirmarEmailCodigo(codigo)
}

function handlePublicBack() {
  if (step.value === 'confirmar-email') {
    step.value = 'conta'
    return
  }

  if (step.value === 'confirmar-whatsapp') {
    step.value = 'confirmar-email'
    return
  }

  if (step.value === 'estabelecimento') {
    step.value = draft.value.usuario.emailConfirmado ? 'confirmar-whatsapp' : 'conta'
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

      <OnboardingConfirmarEmailStep
        v-else-if="step === 'confirmar-email'"
        :email="draft.usuario.email"
        :loading="loading"
        :error-message="erro"
        @confirm="handleConfirmarEmail"
      />

      <OnboardingConfirmarWhatsAppStep
        v-else-if="step === 'confirmar-whatsapp'"
        :email="draft.usuario.email"
        :loading="loading"
        :resending="resendingWhatsApp"
        :error-message="erro"
        :instrucoes="whatsappInstrucoes"
        @verificar="verificarWhatsApp"
        @reenviar="reenviarWhatsApp"
      />

      <OnboardingEstabelecimentoStep
        v-else-if="step === 'estabelecimento'"
        variant="public"
        :modo-autonomo="ehAutonomo"
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
    </template>
  </OnboardingAssinaturaShell>
</template>
