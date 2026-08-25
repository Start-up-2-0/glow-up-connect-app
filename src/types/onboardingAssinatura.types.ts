import type { TipoAssinatura } from '@/types/assinatura.types'

export type OnboardingWizardStep =
  | 'conta'
  | 'confirmar-email'
  | 'confirmar-whatsapp'
  | 'estabelecimento'
  | 'assinatura'

export interface OnboardingUsuarioDraft {
  nome: string
  telefone: string
  email: string
  contaCriada: boolean
  emailConfirmado: boolean
  sexo?: '' | 'Masculino' | 'Feminino'
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
  /** Categoria do estabelecimento (id do catálogo). Obrigatória antes de avançar. */
  categoriaId?: number
  comodidadeIds: number[]
}

export interface OnboardingAssinaturaDraft {
  planoId: number
  tipoAssinatura: TipoAssinatura
  step: OnboardingWizardStep
  usuario: OnboardingUsuarioDraft
  estabelecimento: OnboardingEstabelecimentoDraft
}

export const ONBOARDING_WIZARD_STEPS = [
  { id: 'conta', label: 'Sua conta' },
  { id: 'confirmar-email', label: 'Confirmar e-mail' },
  { id: 'confirmar-whatsapp', label: 'Confirmar WhatsApp' },
  { id: 'estabelecimento', label: 'Estabelecimento' },
  { id: 'assinatura', label: 'Assinatura' },
] as const
