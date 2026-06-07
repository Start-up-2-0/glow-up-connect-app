<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AuthSplashPanel from '@/components/auth/AuthSplashPanel.vue'
import AuthMobileBrand from '@/components/auth/AuthMobileBrand.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import OnboardingUsuarioStep from '@/components/onboarding/OnboardingUsuarioStep.vue'
import OnboardingConfirmarEmailStep from '@/components/onboarding/OnboardingConfirmarEmailStep.vue'
import OnboardingEstabelecimentoStep from '@/components/onboarding/OnboardingEstabelecimentoStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useOnboardingAssinaturaWizard } from '@/composables/useOnboardingAssinaturaWizard'
import { GLOW_AUTH_PANEL_BORDERED_CLASS } from '@/constants/designTokens'

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
  <div class="relative flex min-h-screen bg-white">
    <AuthSplashPanel />

    <main :class="[GLOW_AUTH_PANEL_BORDERED_CLASS, 'overflow-y-auto']">
      <div class="my-auto w-full max-w-[560px] py-6">
        <AuthMobileBrand />

        <OnboardingStepper :current="stepperIndex" />

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
    </main>
  </div>
</template>
