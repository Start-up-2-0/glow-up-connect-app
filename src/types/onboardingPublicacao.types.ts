export interface OnboardingEtapaStatus {
  id: string
  titulo: string
  concluida: boolean
  pendencias: string[]
}

export interface OnboardingPublicacaoStatus {
  estabelecimentoId: number
  tipoAssinatura: 'Estabelecimento' | 'ProfissionalAutonomo' | string
  prontoParaPublicacao: boolean
  visivelPublicamente: boolean
  onboardingObrigatorioPendente: boolean
  proximaEtapa: string | null
  etapas: OnboardingEtapaStatus[]
}

export type LojaSetupBackendStepId = 'equipe' | 'servicos' | 'horarios' | 'perfil' | 'revisao'

export function mapBackendStepToWizardStep(
  backendStep: string | null | undefined,
  ehAutonomo: boolean,
): 'equipe' | 'servicos' | 'horarios' | 'revisao' {
  if (!backendStep || backendStep === 'assinatura' || backendStep === 'revisao') {
    return 'revisao'
  }
  if (backendStep === 'perfil') {
    return ehAutonomo ? 'servicos' : 'revisao'
  }
  if (backendStep === 'equipe' || backendStep === 'servicos' || backendStep === 'horarios') {
    return backendStep
  }
  return 'revisao'
}
