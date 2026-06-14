<script setup lang="ts">
import onboardingCrest from '@/assets/logo/logo.png'
import OnboardingStepper from '@/components/onboarding/OnboardingStepper.vue'
import { GLOW_LOGIN_CONTENT_CLASS, GLOW_LOGIN_PAGE_CLASS } from '@/constants/designTokens'

withDefaults(
  defineProps<{
    isCheckoutStep?: boolean
    showStepper?: boolean
    stepperIndex?: number
    steps?: ReadonlyArray<{ id: string; label: string }>
  }>(),
  {
    isCheckoutStep: false,
    showStepper: true,
    stepperIndex: 0,
  },
)
</script>

<template>
  <div
    :class="[
      GLOW_LOGIN_PAGE_CLASS,
      isCheckoutStep ? 'items-start' : '',
      'overflow-y-auto',
    ]"
  >
    <div
      :class="
        isCheckoutStep
          ? 'flex w-full max-w-6xl flex-col px-4 py-4 lg:px-8'
          : [GLOW_LOGIN_CONTENT_CLASS, 'my-auto py-4']
      "
    >
      <img
        v-if="!isCheckoutStep"
        :src="onboardingCrest"
        alt="Glow Up Connect"
        class="mb-[22px] h-[145px] w-[145px] shrink-0 object-contain"
        width="145"
        height="145"
      />

      <OnboardingStepper
        v-if="showStepper && !isCheckoutStep"
        :current="stepperIndex"
        :steps="steps"
      />

      <slot />
    </div>
  </div>
</template>
