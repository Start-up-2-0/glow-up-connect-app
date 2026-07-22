export type TipoAssinatura = 'Estabelecimento' | 'ProfissionalAutonomo'

export type StatusAssinatura =
  | 'Trial'
  | 'Ativa'
  | 'Inadimplente'
  | 'PendentePagamento'
  | 'Cancelada'
  | 'Suspensa'
  | 'Expirada'

export type StatusCobranca =
  | 'Pendente'
  | 'Pago'
  | 'Recusado'
  | 'Cancelado'
  | 'Atrasado'

export interface EnderecoOnboarding {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
}

export interface EstabelecimentoOnboarding {
  nome: string
  descricao?: string
  logo: string
  telefone?: string
  email?: string
  endereco: EnderecoOnboarding
}

export interface ProfissionalAutonomoOnboarding {
  nomePublico: string
  biografia?: string
  logo: string
  telefone?: string
  email?: string
  endereco: EnderecoOnboarding
}

export interface PagamentoAssinaturaPayload {
  paymentMethodId: string
  token?: string
  issuerId?: string
  installments?: number
  identificationType?: string
  identificationNumber?: string
}

export interface CriarAssinaturaPayload {
  planoId: number
  tipoAssinatura: TipoAssinatura
  estabelecimento?: EstabelecimentoOnboarding
  estabelecimentoId?: number
  profissionalAutonomo?: ProfissionalAutonomoOnboarding
  gateway: 'MercadoPago'
  pagamento?: PagamentoAssinaturaPayload
}

export interface PagamentoInicial {
  checkoutUrl?: string | null
  qrCode?: string | null
}

export interface Assinatura {
  id: number
  planoId: number
  estabelecimentoId: number
  status: StatusAssinatura
  gateway: string
  inicio: string
  fim: string | null
  dataReferenciaCiclo: string
  proximaDataVencimento: string
  proximaDataGeracaoCobranca: string
  proximaDataAlerta: string
  emTrial: boolean
  diasTrial: number
  pagamentoInicial: PagamentoInicial | null
  requerConfirmacaoEmail?: boolean
}

export interface TrocarPlanoPayload {
  novoPlanoId: number
  gateway: 'MercadoPago'
  pagamento: PagamentoAssinaturaPayload
}

export interface CobrancaAssinatura {
  id: number
  valor: number
  status: StatusCobranca
  moeda: string
  tipoCobranca: string
  numeroCiclo: number
  dataVencimento: string
  dataGeracao: string
  cicloInicio: string
  cicloFim: string
  gatewayPaymentId: string
  pagoEm: string | null
}

export interface AdicionarEstabelecimentoPayload {
  estabelecimento: EstabelecimentoOnboarding
}

export interface AdicionarEstabelecimentoResponse {
  estabelecimentoId: number
  nome: string
  assinaturaId: number
}
