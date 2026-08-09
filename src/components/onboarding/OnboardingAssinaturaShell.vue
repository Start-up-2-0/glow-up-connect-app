<script setup lang="ts">
import OnboardingPublicWizardStepper from '@/components/onboarding/OnboardingPublicWizardStepper.vue'
import OnboardingContratarStepper from '@/components/onboarding/OnboardingContratarStepper.vue'
import OnboardingPlanoResumoCard from '@/components/onboarding/OnboardingPlanoResumoCard.vue'
import {
  PUBLIC_ONBOARDING_TOTAL,
  type OnboardingUiVariant,
} from '@/constants/onboardingWizardSteps'
import {
  AGENDAR_WIZARD_CONTENT_CLASS,
  ONBOARDING_CONTRATAR_PAGE_CLASS,
} from '@/constants/designTokens'
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

  <div v-else :class="ONBOARDING_CONTRATAR_PAGE_CLASS">
    <div class="space-y-6">
      <header v-if="!isCheckoutStep">
        <h1 class="font-satoshi text-2xl font-bold text-glow-text">
          {{
            title
              || 'Assinatura'
          }}
        </h1>
        <p class="mt-2 font-satoshi text-base text-glow-text-subtle">
          {{
            description
              || (modoAutonomo
                ? 'Ative seu plano e complete os dados do perfil profissional.'
                : 'Ative seu plano e complete os dados do estabelecimento.')
          }}
        </p>
      </header>

      <header v-else class="flex items-start gap-4">
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

      <hr class="border-glow-border-soft" />

      <OnboardingContratarStepper
        v-if="showStepper && steps"
        :current="stepperIndex"
        :steps="steps"
        :skipped-ids="skippedIds"
        :variant="modoAutonomo ? 'autonomo' : 'default'"
      />

      <p
        v-if="!isCheckoutStep && stepSubtitle"
        class="font-satoshi text-base text-glow-text-subtle"
        :class="planoResumo ? 'text-left' : 'text-center'"
      >
        {{ stepSubtitle }}
      </p>

      <div
        v-if="!isCheckoutStep && planoResumo"
        class="grid w-full gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
      >
        <OnboardingPlanoResumoCard
          :plano="planoResumo"
          :promocao="promocaoResumo"
          variant="sidebar"
        />

        <div class="min-w-0">
          <slot />
        </div>
      </div>

      <div v-else class="w-full">
        <slot />
      </div>
    </div>
  </div>
</template>
