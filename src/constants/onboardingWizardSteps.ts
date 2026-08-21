import type { OnboardingWizardStep } from '@/types/onboardingAssinatura.types'

export type OnboardingUiVariant = 'public' | 'dashboard' | 'contratar'

/** Ordem real do fluxo público de assinatura */
export const PUBLIC_ONBOARDING_FLOW_STEPS = [
  { id: 'conta', label: 'Sua conta' },
  { id: 'confirmar-email', label: 'Confirmar e-mail' },
  { id: 'confirmar-whatsapp', label: 'Confirmar WhatsApp' },
  { id: 'estabelecimento', label: 'Estabelecimento' },
  { id: 'assinatura', label: 'Assinatura' },
] as const satisfies ReadonlyArray<{ id: OnboardingWizardStep; label: string }>

export const PUBLIC_ONBOARDING_TOTAL = PUBLIC_ONBOARDING_FLOW_STEPS.length

export function resolvePublicOnboardingStep(step: OnboardingWizardStep) {
  const index = PUBLIC_ONBOARDING_FLOW_STEPS.findIndex((item) => item.id === step)
  const safeIndex = index >= 0 ? index : 0

  return {
    index: safeIndex + 1,
    label: PUBLIC_ONBOARDING_FLOW_STEPS[safeIndex]?.label ?? 'Assinatura',
    showStepper: step !== 'assinatura',
    showBack: step !== 'conta' && step !== 'assinatura',
  }
}
