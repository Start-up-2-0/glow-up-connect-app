<script setup lang="ts">
import OnboardingPublicWizardStepper from '@/components/onboarding/OnboardingPublicWizardStepper.vue'
import OnboardingContratarStepper from '@/components/onboarding/OnboardingContratarStepper.vue'
import OnboardingPlanoResumoCard from '@/components/onboarding/OnboardingPlanoResumoCard.vue'
import {
  PUBLIC_ONBOARDING_TOTAL,
  type OnboardingUiVariant,
} from '@/constants/onboardingWizardSteps'
import { AGENDAR_WIZARD_CONTENT_CLASS } from '@/constants/designTokens'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

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
    skippedIds?: ReadonlyArray<string>
    modoAutonomo?: boolean
    title?: string
    description?: string
    planoResumo?: Plano | null
    promocaoResumo?: PromocaoLancamento | null
  }>(),
  {
    isCheckoutStep: false,
    showStepper: true,
    stepperIndex: 0,
    publicStepIndex: 1,
    publicStepLabel: '',
    publicShowBack: false,
    stepSubtitle: '',
    modoAutonomo: false,
    title: '',
    description: '',
    planoResumo: null,
    promocaoResumo: null,
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

  <!-- Checkout: layout simples -->
  <div
    v-else-if="isCheckoutStep"
    class="-mx-4 -mt-4 min-h-full bg-glow-canvas px-4 pb-8 pt-9 lg:-mx-6 lg:-mt-6 lg:px-8"
  >
    <header class="mb-6 flex items-start gap-4">
      <button
        type="button"
        class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-glow-border-soft bg-glow-hover-surface text-glow-text-subtle transition hover:bg-glow-surface hover:text-glow-text"
        aria-label="Voltar"
        @click="emit('back')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div>
        <h1 class="font-satoshi text-2xl font-bold text-glow-text">Finalize a sua assinatura</h1>
        <p class="mt-2 font-satoshi text-base text-glow-text-subtle">
          Escolha o vencimento e conclua o pagamento para ativar seu plano.
        </p>
      </div>
    </header>
    <slot />
  </div>

  <!-- Flowbite-style split: plano | formulário -->
  <div
    v-else-if="planoResumo"
    class="-mx-4 -mt-4 flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden bg-glow-canvas lg:-mx-6 lg:-mt-6 lg:flex-row"
  >
    <!-- Plano: mobile no topo -->
    <div class="lg:hidden">
      <OnboardingPlanoResumoCard
        :plano="planoResumo"
        :promocao="promocaoResumo"
        variant="panel"
      />
    </div>

    <!-- Plano: desktop sidebar -->
    <div class="hidden w-[min(100%,380px)] shrink-0 self-stretch lg:block">
      <div class="sticky top-0 h-[calc(100vh-4rem)] min-h-full overflow-y-auto">
        <OnboardingPlanoResumoCard
          :plano="planoResumo"
          :promocao="promocaoResumo"
          variant="panel"
        />
      </div>
    </div>

    <main class="flex min-w-0 flex-1 flex-col bg-glow-bg-elevated px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
      <OnboardingContratarStepper
        v-if="showStepper && steps"
        :current="stepperIndex"
        :steps="steps"
        :skipped-ids="skippedIds"
        variant="flowbite"
      />

      <header class="mt-8 max-w-3xl">
        <p class="font-urbanist text-xs font-bold uppercase tracking-[0.14em] text-glow-gold-cta">
          Onboarding de assinatura
        </p>
        <h1 class="mt-2 font-satoshi text-3xl font-bold tracking-tight text-glow-text">
          {{ title || 'Assinatura' }}
        </h1>
        <p
          v-if="description || stepSubtitle"
          class="mt-2 max-w-2xl font-satoshi text-base text-glow-text-subtle"
        >
          {{ description || stepSubtitle }}
        </p>
      </header>

      <div class="mt-8 max-w-3xl flex-1">
        <slot />
      </div>
    </main>
  </div>

  <!-- Fallback sem plano -->
  <div
    v-else
    class="-mx-4 -mt-4 min-h-full bg-glow-canvas px-4 pb-8 pt-9 lg:-mx-6 lg:-mt-6 lg:px-8"
  >
    <header v-if="!isCheckoutStep" class="mb-6">
      <h1 class="font-satoshi text-2xl font-bold text-glow-text">
        {{ title || 'Assinatura' }}
      </h1>
      <p v-if="description" class="mt-2 font-satoshi text-base text-glow-text-subtle">
        {{ description }}
      </p>
    </header>
    <OnboardingContratarStepper
      v-if="showStepper && steps"
      :current="stepperIndex"
      :steps="steps"
      :skipped-ids="skippedIds"
    />
    <div class="mt-6 w-full">
      <slot />
    </div>
  </div>
</template>
