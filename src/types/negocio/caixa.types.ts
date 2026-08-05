export interface CaixaResumo {
  id: number
  estabelecimentoId: number
  saldoTotal: number
  saldoDisponivel: number
  saldoRetido: number
}

export interface LancamentoCaixa {
  id: number
  caixaId: number
  agendamentoId: number | null
  pagamentoId: number | null
  profissionalId: number | null
  tipo: string
  valor: number
  descricao: string
  criadoEm: string
}

export interface LancamentoCaixaFiltro {
  inicio?: string
  fim?: string
  q?: string
  tipo?: string
  status?: string
  pagina?: number
  tamanhoPagina?: number
}

export interface LancamentoCaixaPaginado {
  total: number
  pagina: number
  tamanhoPagina: number
  itens: LancamentoCaixa[]
}

export interface FinanceiroResumo {
  saldoTotal: number
  saldoDisponivel: number
  saldoRetido: number
  entradasPeriodo: number
  saidasPeriodo: number
  totalLancamentosPeriodo: number
  periodoInicio: string | null
  periodoFim: string | null
}

export interface ComissaoProfissional {
  id: number
  profissionalEstabelecimentoId: number
  profissionalId: number
  nomePublico: string
  tipoComissao: string
  percentual: number | null
  valorFixo: number | null
  ativo: boolean
  inicioVigencia: string
  fimVigencia: string | null
}

export type FormaRecebimentoPresencial =
  | 'Dinheiro'
  | 'Pix'
  | 'CartaoDebito'
  | 'CartaoCredito'
  | 'Outro'

export type SubtipoAjusteManual = 'Reforco' | 'Sangria'

export interface RegistrarAjusteCaixaPayload {
  subtipo: SubtipoAjusteManual
  valor: number
  descricao: string
}

export interface ReceberAgendamentoPayload {
  formaRecebimento: FormaRecebimentoPresencial
  valor?: number
}

export interface ReceberAgendamentoResultado {
  agendamentoId: number
  status: string
  pagamentoId: number
  lancamentoCaixaId: number
  valorRecebido: number
  formaRecebimento: string
  lancamentosComissaoIds: number[]
}

export interface SessaoCaixa {
  id: number
  caixaId: number
  usuarioId: number
  abertoEm: string
  fechadoEm: string | null
  saldoInicial: number
  saldoInformadoFechamento: number | null
  diferenca: number | null
  status: string
}

export interface CriarComissaoPayload {
  profissionalEstabelecimentoId: number
  tipoComissao: string
  percentual?: number | null
  valorFixo?: number | null
  inicioVigencia: string
  fimVigencia?: string | null
}

export interface AtualizarComissaoPayload {
  tipoComissao: string
  percentual?: number | null
  valorFixo?: number | null
  inicioVigencia: string
  fimVigencia?: string | null
  ativo: boolean
}

export interface ComissaoExtrato {
  lancamentoId: number
  agendamentoId: number | null
  valor: number
  descricao: string
  criadoEm: string
}

export interface RelatorioAnalitico {
  faturamentoTotal: number
  atendimentosPagos: number
  ticketMedio: number
  porProfissional: { profissionalId: number; nomePublico: string; faturamento: number; quantidade: number }[]
  porFormaPagamento: { formaPagamento: string; total: number; quantidade: number }[]
}

export interface FluxoCaixaDia {
  data: string
  saldoInicialDia: number
  entradas: number
  saidas: number
  saldoFinalDia: number
}

export interface FluxoCaixa {
  saldoInicial: number
  dias: FluxoCaixaDia[]
  saldoFinal: number
  projecaoReceitaFutura: number | null
}

export interface ContaReceber {
  id: number
  estabelecimentoId: number
  agendamentoId: number | null
  descricao: string
  valor: number
  vencimento: string
  status: string
}

export interface ContaPagar {
  id: number
  estabelecimentoId: number
  fornecedor: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string
  recorrente: boolean
  status: string
}

export interface ConciliacaoItem {
  id: number
  lancamentoCaixaId: number | null
  descricaoExtrato: string
  valorExtrato: number
  dataExtrato: string
  conciliado: boolean
}

export interface FinanceiroBuscaResultado {
  lancamentos: LancamentoCaixa[]
  contasReceber: ContaReceber[]
  contasPagar: ContaPagar[]
}

export type ExportFormato = 'csv' | 'xlsx' | 'pdf'

export interface BaixarContaPayload {
  formaBaixa?: string
  observacao?: string
}

export interface AtualizarContaReceberPayload {
  descricao: string
  valor: number
  vencimento: string
}

export interface AtualizarContaPagarPayload {
  fornecedor: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string
  recorrente: boolean
}

export interface Meta {
  id: number
  nome: string
  tipoMeta: 'Atendimentos' | 'Faturamento' | 'Mista'
  valorMeta: number
  percentualComissao: number
  ativa: boolean
  recorrente: boolean
  profissionalEstabelecimentoId: number | null
  createAd: string
  updatedAt: string | null
}

export interface CriarMetaPayload {
  nome: string
  tipoMeta: 'Atendimentos' | 'Faturamento' | 'Mista'
  valorMeta: number
  percentualComissao: number
  recorrente: boolean
  profissionalEstabelecimentoId?: number | null
}

export interface AtualizarMetaPayload {
  nome: string
  tipoMeta: 'Atendimentos' | 'Faturamento' | 'Mista'
  valorMeta: number
  percentualComissao: number
  ativa: boolean
  recorrente: boolean
  profissionalEstabelecimentoId?: number | null
}

export interface MetaProgressoProfissional {
  profissionalEstabelecimentoId: number
  profissionalId: number
  nomePublico: string
  metaNome: string
  tipoMeta: string
  valorMeta: number
  percentualComissao: number
  quantidadeRealizada: number | null
  valorRealizado: number | null
  percentualProgresso: number
  atingida: boolean
}

/* ---------- Gerenciador de metas de comissão (refatoração) ---------- */

export type MetaComissaoStatus = 'EmAndamento' | 'Concluida' | 'Cancelada'

/** Linha da listagem — profissional com meta ativa no mês selecionado. */
export interface MetaComissaoProfissional {
  profissionalEstabelecimentoId: number
  profissionalId: number
  nomePublico: string
  avatarUrl?: string | null
  metaId: number
  nomeMeta: string
  tipoMeta: 'Atendimentos' | 'Faturamento' | 'Mista'
  valorMeta: number
  percentualComissao: number
  status: MetaComissaoStatus
  dataInicio: string
  dataFim: string
  quantidadeRealizada: number | null
  valorRealizado: number | null
  percentualProgresso: number
  atingida: boolean
}

/** Item do histórico de evolução da meta (não financeiro). */
export interface MetaComissaoEvolucaoItem {
  id: number
  data: string
  descricao: string
  quantidade: number
  valor: number | null
}

/**
 * Notificações/automações disparadas quando a meta é concluída.
 * Preenchido apenas para metas com status `Concluida`.
 */
export interface MetaComissaoNotificacoes {
  concluidaEm: string
  emailProfissionalEnviado: boolean
  whatsAppProfissionalEnviado: boolean
  lojaNotificada: boolean
  logAuditoriaRegistrado: boolean
}

/** Detalhe completo da meta exibido na modal. */
export interface MetaComissaoDetalhe extends MetaComissaoProfissional {
  criadoEm: string
  responsavelCriacao: string
  evolucao: MetaComissaoEvolucaoItem[]
  notificacoes?: MetaComissaoNotificacoes
}

export interface ComissaoMetasFiltro {
  mes?: number
  ano?: number
  profissionalId?: number
}
