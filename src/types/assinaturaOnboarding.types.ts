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
}

/** Steps do wizard logado (estabelecimento + autônomo). */
export type AssinaturaLogadaWizardStep =
  | 'informacoes-basicas'
  | 'dados'
  | 'perfil'
  | 'endereco'
  | 'confirmar'
  | 'revisao'
  | 'assinatura'

export const ASSINATURA_LOGADA_WIZARD_STEPS = [
  { id: 'informacoes-basicas', label: 'Informações básicas' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'confirmar', label: 'Confirmar dados' },
  { id: 'assinatura', label: 'Assinatura' },
] as const

export const ASSINATURA_LOGADA_WIZARD_STEPS_AUTONOMO = [
  { id: 'dados', label: 'Dados' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'endereco', label: 'Localização' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'assinatura', label: 'Assinatura' },
] as const

export const ASSINATURA_LOGADA_STEP_SUBTITLES: Partial<Record<AssinaturaLogadaWizardStep, string>> = {
  'informacoes-basicas':
    'Preencha os dados básicos que identificarão o seu negócio na plataforma.',
  endereco: 'Informe o endereço onde seu estabelecimento está localizado.',
  confirmar: 'Revise o plano e o estabelecimento antes de concluir a assinatura.',
  assinatura: '',
}

export const ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO: Partial<
  Record<AssinaturaLogadaWizardStep, string>
> = {
  dados: 'Encontramos seus dados. Revise ou edite as informações da sua conta.',
  perfil: 'Configure como seu perfil profissional aparece para os clientes.',
  endereco: 'Informe a localização de atendimento para aparecer na busca e no mapa.',
  revisao: 'Confira a prévia do seu perfil antes de finalizar a assinatura.',
  assinatura: '',
}

/** Migra steps antigos salvos no sessionStorage (autônomo). */
export function normalizeAutonomoStoredStep(step: string): AssinaturaLogadaWizardStep {
  if (step === 'informacoes-basicas' || step === 'estabelecimento') return 'dados'
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
