export type OnboardingWizardStep = 'conta' | 'confirmar-email' | 'estabelecimento' | 'assinatura'

export interface OnboardingUsuarioDraft {
  nome: string
  telefone: string
  email: string
  contaCriada: boolean
  emailConfirmado: boolean
}

export interface OnboardingEstabelecimentoDraft {
  nome: string
  descricao: string
  telefone: string
  email: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento: string
  logoDataUrl: string | null
}

export interface OnboardingAssinaturaDraft {
  planoId: number
  step: OnboardingWizardStep
  usuario: OnboardingUsuarioDraft
  estabelecimento: OnboardingEstabelecimentoDraft
}

export const ONBOARDING_WIZARD_STEPS = [
  { id: 'conta', label: 'Sua conta' },
  { id: 'estabelecimento', label: 'Estabelecimento' },
  { id: 'assinatura', label: 'Assinatura' },
  { id: 'confirmar-email', label: 'Confirmar e-mail' },
] as const
