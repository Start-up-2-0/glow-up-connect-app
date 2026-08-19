import type { OnboardingEtapaStatus } from '@/types/onboardingPublicacao.types'

export type AssinaturaOnboardingEtapa =
  | 'EscolherPlano'
  | 'CadastrarEstabelecimento'
  | 'AssinarPlano'
  | 'GerenciarAssinatura'
  | 'AdicionarLoja'

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
  podeAdicionarLoja: boolean
  lojasVinculadas: number
  limiteLojas: number | null
  assinaturaPremiumId: number | null
  onboardingObrigatorioPendente?: boolean
  proximaEtapaPublicacao?: string | null
  etapasPublicacao?: OnboardingEtapaStatus[] | null
}

/** Steps do wizard logado (estabelecimento + autônomo). */
export type AssinaturaLogadaWizardStep =
  | 'informacoes-basicas'
  | 'perfil'
  | 'endereco'
  | 'confirmar'
  | 'revisao'
  | 'assinatura'
  | 'servicos'
  | 'horarios'

export const ASSINATURA_LOGADA_WIZARD_STEPS = [
  { id: 'informacoes-basicas', label: 'Informações básicas' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'confirmar', label: 'Confirmar dados' },
  { id: 'assinatura', label: 'Assinatura' },
] as const

export const ASSINATURA_LOGADA_WIZARD_STEPS_AUTONOMO = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'endereco', label: 'Localização' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'assinatura', label: 'Assinatura' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'horarios', label: 'Horários' },
] as const

export const ASSINATURA_LOGADA_STEP_SUBTITLES: Partial<Record<AssinaturaLogadaWizardStep, string>> = {
  'informacoes-basicas': 'Informações do estabelecimento',
  endereco: 'Endereço do estabelecimento',
  confirmar: 'Revise e confirme para finalizar',
  assinatura: '',
}

export const ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO: Partial<
  Record<AssinaturaLogadaWizardStep, string>
> = {
  perfil: 'Como você aparece para os clientes',
  endereco: 'Onde você atende',
  revisao: 'Revise e confirme para finalizar',
  assinatura: '',
  servicos: 'O que você oferece e quanto cobra',
  horarios: 'Quando você atende',
}

/** Migra steps antigos salvos no sessionStorage (autônomo). */
export function normalizeAutonomoStoredStep(step: string): AssinaturaLogadaWizardStep {
  if (
    step === 'informacoes-basicas'
    || step === 'estabelecimento'
    || step === 'dados'
  ) {
    return 'perfil'
  }
  if (step === 'confirmar') return 'revisao'
  return step as AssinaturaLogadaWizardStep
}

export function normalizeEstabelecimentoStoredStep(step: string): AssinaturaLogadaWizardStep {
  if (step === 'estabelecimento') return 'informacoes-basicas'
  if (step === 'dados') return 'informacoes-basicas'
  if (step === 'perfil') return 'informacoes-basicas'
  if (step === 'revisao') return 'confirmar'
  return step as AssinaturaLogadaWizardStep
}
