export type AssinaturaOnboardingEtapa =
  | 'EscolherPlano'
  | 'CadastrarEstabelecimento'
  | 'AssinarPlano'
  | 'GerenciarAssinatura'

export interface EstabelecimentoOnboardingContexto {
  estabelecimentoId: number
  nome: string
  logo: string | null
  assinaturaAtiva: boolean
  assinaturaPendente: boolean
  podeContratar: boolean
}

export interface AssinaturaOnboardingContexto {
  temEstabelecimentoProprio: boolean
  estabelecimentos: EstabelecimentoOnboardingContexto[]
  proximaEtapa: AssinaturaOnboardingEtapa
  estabelecimentoIdSugerido: number | null
}

export type AssinaturaLogadaWizardStep = 'estabelecimento' | 'confirmar' | 'assinatura'

export const ASSINATURA_LOGADA_WIZARD_STEPS = [
  { id: 'estabelecimento', label: 'Estabelecimento' },
  { id: 'confirmar', label: 'Confirmar dados' },
  { id: 'assinatura', label: 'Assinatura' },
] as const
