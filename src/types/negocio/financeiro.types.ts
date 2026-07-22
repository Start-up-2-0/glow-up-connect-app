export type MovimentoDirecao = 'entrada' | 'saida'

export type MovimentoStatus =
  | 'recebido'
  | 'pago'
  | 'pendente'
  | 'vencido'
  | 'estornado'
  | 'cancelado'

export type MovimentoOrigem =
  | 'atendimento'
  | 'manual'
  | 'conta'
  | 'pagamento_online'
  | 'comissao'

export interface MovimentoFinanceiroAcoes {
  podeMarcarRecebido: boolean
  podeMarcarPago: boolean
  podeEstornar: boolean
}

export interface MovimentoFinanceiro {
  id: string
  direcao: MovimentoDirecao
  valor: number
  descricao: string
  data: string
  status: MovimentoStatus
  origem: MovimentoOrigem
  formaPagamento: string | null
  categoria: string | null
  vencimento: string | null
  agendamentoId: number | null
  acoes: MovimentoFinanceiroAcoes
}

export interface MovimentosFinanceirosPaginado {
  total: number
  pagina: number
  tamanhoPagina: number
  itens: MovimentoFinanceiro[]
}

export interface MovimentosFinanceirosFiltro {
  inicio?: string
  fim?: string
  status?: string
  q?: string
  pagina?: number
  tamanhoPagina?: number
}

export interface CriarMovimentoPayload {
  valor: number
  descricao: string
  data?: string | null
  formaPagamento?: string | null
  categoria?: string | null
  vencimento?: string | null
}

export interface FinanceiroDashboard {
  saldoAtual: number
  totalEntradas: number
  totalSaidas: number
  lucroLiquido: number
  contasEmAberto: number
  quantidadeContasEmAberto: number
  comissoesPeriodo: number
  periodoInicio: string | null
  periodoFim: string | null
}

export interface FinanceiroPeriodoFiltro {
  inicio?: string
  fim?: string
}

export const CATEGORIAS_SAIDA = [
  'Fornecedor',
  'Salário',
  'Aluguel',
  'Imposto',
  'Outro',
] as const

export const FORMAS_RECEBIMENTO = [
  'Pix',
  'Dinheiro',
  'Cartão',
  'Transferência',
  'Outro',
] as const
