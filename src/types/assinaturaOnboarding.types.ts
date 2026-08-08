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

export type AssinaturaLogadaWizardStep =
  | 'informacoes-basicas'
  | 'endereco'
  | 'confirmar'
  | 'assinatura'

export const ASSINATURA_LOGADA_WIZARD_STEPS = [
  { id: 'informacoes-basicas', label: 'Informações básicas' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'confirmar', label: 'Confirmar dados' },
  { id: 'assinatura', label: 'Assinatura' },
] as const

export const ASSINATURA_LOGADA_WIZARD_STEPS_AUTONOMO = [
  { id: 'informacoes-basicas', label: 'Seus dados' },
  { id: 'endereco', label: 'Localização' },
  { id: 'confirmar', label: 'Confirmar dados' },
  { id: 'assinatura', label: 'Assinatura' },
] as const

export const ASSINATURA_LOGADA_STEP_SUBTITLES: Record<AssinaturaLogadaWizardStep, string> = {
  'informacoes-basicas':
    'Preencha os dados básicos que identificarão o seu negócio na plataforma.',
  endereco: 'Informe o endereço onde seu estabelecimento está localizado.',
  confirmar: 'Revise o plano e o estabelecimento antes de concluir a assinatura.',
  assinatura: '',
}

export const ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO: Record<AssinaturaLogadaWizardStep, string> = {
  'informacoes-basicas':
    'Revise os dados que identificarão o seu perfil profissional na plataforma.',
  endereco: 'Informe a localização de atendimento para aparecer na busca e no mapa.',
  confirmar: 'Revise o plano e a prévia do seu perfil profissional antes de concluir.',
  assinatura: '',
}
