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
