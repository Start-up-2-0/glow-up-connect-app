<script setup lang="ts">
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import OnboardingPublicWizardStepper from '@/components/onboarding/OnboardingPublicWizardStepper.vue'
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
    steps?: ReadonlyArray<{ id: string; label: string }>
  }>(),
  {
    isCheckoutStep: false,
    showStepper: true,
    stepperIndex: 0,
    publicStepIndex: 1,
    publicStepLabel: '',
    publicShowBack: false,
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
    :class="isCheckoutStep ? 'page-shell max-w-6xl' : 'page-shell--form'"
  >
    <header v-if="!isCheckoutStep">
      <h1 class="font-satoshi text-2xl font-bold text-glow-text lg:text-3xl">Contratar plano</h1>
      <p class="mt-2 text-glow-text-subtle">
        Complete as etapas para vincular o plano ao seu estabelecimento.
      </p>
    </header>

    <OnboardingStepper
      v-if="showStepper && !isCheckoutStep"
      :current="stepperIndex"
      :steps="steps"
    />

    <slot />
  </div>
</template>
