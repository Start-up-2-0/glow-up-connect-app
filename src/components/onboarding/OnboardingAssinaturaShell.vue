<script setup lang="ts">
import OnboardingPublicWizardStepper from '@/components/onboarding/OnboardingPublicWizardStepper.vue'
import OnboardingContratarStepper from '@/components/onboarding/OnboardingContratarStepper.vue'
import {
  PUBLIC_ONBOARDING_TOTAL,
  type OnboardingUiVariant,
} from '@/constants/onboardingWizardSteps'
import { AGENDAR_WIZARD_CONTENT_CLASS } from '@/constants/designTokens'

withDefaults(
  defineProps<{
    variant: OnboardingUiVariant
    isCheckoutStep?: boolean
    showStepper?: boolean
    stepperIndex?: number
    publicStepIndex?: number
    publicStepLabel?: string
    publicShowBack?: boolean
    stepSubtitle?: string
    steps?: ReadonlyArray<{ id: string; label: string }>
  }>(),
  {
    isCheckoutStep: false,
    showStepper: true,
    stepperIndex: 0,
    publicStepIndex: 1,
    publicStepLabel: '',
    publicShowBack: false,
    stepSubtitle: '',
  },
)

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div
    v-if="variant === 'public'"
    :class="isCheckoutStep ? 'mx-auto w-full max-w-6xl' : AGENDAR_WIZARD_CONTENT_CLASS"
  >
    <OnboardingPublicWizardStepper
      v-if="showStepper && !isCheckoutStep"
      :step-index="publicStepIndex"
      :step-label="publicStepLabel"
      :total-steps="PUBLIC_ONBOARDING_TOTAL"
      :show-back="publicShowBack"
      @back="emit('back')"
    />
    <slot />
  </div>

  <div
    v-else
    class="space-y-6"
    :class="isCheckoutStep ? 'page-shell max-w-6xl' : 'mx-auto w-full max-w-[721px]'"
  >
    <header v-if="!isCheckoutStep">
      <h1 class="font-satoshi text-2xl font-bold text-glow-text">Contratar plano</h1>
      <p class="mt-2 text-base text-glow-text/50">
        Complete as etapas para vincular o plano ao seu estabelecimento.
      </p>
    </header>

    <header v-else class="flex items-start gap-4">
      <button
        type="button"
        class="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-glow-text/20 text-glow-text/70 transition hover:bg-glow-hover-surface hover:text-glow-text"
        aria-label="Voltar"
        @click="emit('back')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div>
        <h1 class="font-satoshi text-2xl font-bold text-glow-text">Finalize a sua assinatura</h1>
        <p class="mt-2 text-base text-glow-text/50">
          Escolha o vencimento e conclua o pagamento para ativar seu plano.
        </p>
      </div>
    </header>

    <hr class="border-glow-text/20" />

    <OnboardingContratarStepper
      v-if="showStepper && steps"
      :current="stepperIndex"
      :steps="steps"
    />

    <p
      v-if="!isCheckoutStep && stepSubtitle"
      class="text-center text-base text-glow-text/50"
    >
      {{ stepSubtitle }}
    </p>

    <slot />
  </div>
</template>
