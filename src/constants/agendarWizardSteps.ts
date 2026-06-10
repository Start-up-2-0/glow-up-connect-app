import type { WizardStep } from '@/composables/useAgendarWizard'

export const AGENDAR_FIGMA_STEPS = [
  { index: 1, label: 'Identificação', wizardSteps: ['identidade', 'contato'] as WizardStep[] },
  { index: 2, label: 'Serviços', wizardSteps: ['servicos'] as WizardStep[] },
  { index: 3, label: 'Data', wizardSteps: ['data'] as WizardStep[] },
  { index: 4, label: 'Horário', wizardSteps: ['horario'] as WizardStep[] },
  { index: 5, label: 'Revisão', wizardSteps: ['confirmar'] as WizardStep[] },
] as const

export const AGENDAR_FIGMA_TOTAL = 5

export function resolveAgendarFigmaStep(step: WizardStep) {
  if (step === 'sucesso' || step === 'sucesso_cadastro') {
    return { index: AGENDAR_FIGMA_TOTAL, label: 'Conclusão', showStepper: false }
  }

  const found = AGENDAR_FIGMA_STEPS.find((item) => item.wizardSteps.includes(step))
  return {
    index: found?.index ?? 1,
    label: found?.label ?? 'Identificação',
    showStepper: true,
  }
}
