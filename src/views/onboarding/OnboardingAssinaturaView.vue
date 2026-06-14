<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import onboardingCrest from '@/assets/logo/logo.png'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import OnboardingUsuarioStep from '@/components/onboarding/OnboardingUsuarioStep.vue'
import OnboardingConfirmarEmailStep from '@/components/onboarding/OnboardingConfirmarEmailStep.vue'
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useOnboardingAssinaturaWizard } from '@/composables/useOnboardingAssinaturaWizard'
import { GLOW_LOGIN_CONTENT_CLASS, GLOW_LOGIN_PAGE_CLASS } from '@/constants/designTokens'

const route = useRoute()
const planoId = computed(() => Number(route.query.planoId))

const wizard = useOnboardingAssinaturaWizard(planoId.value)

const {
  draft,
  step,
  stepperIndex,
  plano,
  promocao,
  loading,
  submitting,
  aguardandoPagamento,
  pixQrCode,
  pixCheckoutUrl,
  erro,
  fieldErrors,
  init,
  cadastrarConta,
  confirmarEmailCodigo,
  avancarParaAssinatura,
  voltarParaEstabelecimento,
  contratarPlano,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')

const contentClass = computed(() =>
  isCheckoutStep.value
    ? 'flex w-full max-w-6xl flex-col px-4 py-4 lg:px-8'
    : [GLOW_LOGIN_CONTENT_CLASS, 'my-auto py-4'],
)

const diasPermitidos = computed(
  () => promocao.value?.diasVencimentoPermitidos ?? [5, 10, 15, 20],
)

onMounted(() => {
  void init()
})

async function handleConfirmarEmail(codigo: string) {
  const ok = await confirmarEmailCodigo(codigo)
  if (!ok) {
    // erro já preenchido no composable
  }
}
</script>

<template>
  <div
    :class="[
      GLOW_LOGIN_PAGE_CLASS,
      isCheckoutStep ? 'items-start' : '',
      'overflow-y-auto',
    ]"
  >
    <div :class="contentClass">
      <img
        v-if="!isCheckoutStep"
        :src="onboardingCrest"
        alt="Glow Up Connect"
        class="mb-[22px] h-[145px] w-[145px] shrink-0 object-contain"
        width="145"
        height="145"
      />

      <OnboardingStepper v-if="!isCheckoutStep" :current="stepperIndex" />

      <LoadingSpinner v-if="loading && !plano" />

      <template v-else-if="plano">
        <OnboardingUsuarioStep
          v-if="step === 'conta'"
          :initial="draft.usuario"
          :loading="loading"
          :error-message="erro"
          :field-errors="fieldErrors"
          @submit="cadastrarConta"
        />

        <OnboardingEstabelecimentoStep
          v-else-if="step === 'estabelecimento'"
          :initial="draft.estabelecimento"
          :loading="loading"
          :error-message="erro"
          @submit="avancarParaAssinatura"
        />

        <OnboardingPagamentoStep
          v-else-if="step === 'assinatura'"
          :plano="plano"
          :promocao="promocao"
          :dias-permitidos="diasPermitidos"
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
    </div>
  </div>
</template>
