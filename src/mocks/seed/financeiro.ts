import type {
  CaixaResumo,
  ComissaoExtrato,
  ComissaoProfissional,
  ContaPagar,
  ContaReceber,
  ConciliacaoItem,
  FinanceiroResumo,
  FluxoCaixa,
  LancamentoCaixa,
  Meta,
  MetaComissaoDetalhe,
  MetaComissaoEvolucaoItem,
  MetaComissaoNotificacoes,
  MetaComissaoProfissional,
  MetaProgressoProfissional,
  RelatorioAnalitico,
  SessaoCaixa,
} from '@/types/negocio/caixa.types'
import type {
  FinanceiroDashboard,
  MovimentoFinanceiro,
} from '@/types/negocio/financeiro.types'

function iso(daysFromNow: number, hour = 12): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

/* ---------- Metas de Comissão (foco atual) ---------- */

export const MOCK_METAS: Meta[] = [
  {
    id: 1,
    nome: 'Meta de Atendimentos - Marina',
    tipoMeta: 'Atendimentos',
    valorMeta: 80,
    percentualComissao: 5,
    ativa: true,
    recorrente: true,
    profissionalEstabelecimentoId: 101,
    createAd: iso(-25),
    updatedAt: iso(-2),
  },
  {
    id: 2,
    nome: 'Meta de Faturamento - Carlos',
    tipoMeta: 'Faturamento',
    valorMeta: 8000,
    percentualComissao: 8,
    ativa: true,
    recorrente: true,
    profissionalEstabelecimentoId: 102,
    createAd: iso(-20),
    updatedAt: iso(-1),
  },
  {
    id: 3,
    nome: 'Meta Lançamento - Patrícia',
    tipoMeta: 'Atendimentos',
    valorMeta: 50,
    percentualComissao: 4,
    ativa: false,
    recorrente: false,
    profissionalEstabelecimentoId: 103,
    createAd: iso(-40),
    updatedAt: iso(-15),
  },
  {
    id: 4,
    nome: 'Meta Mista - Equipe',
    tipoMeta: 'Mista',
    valorMeta: 120,
    percentualComissao: 6,
    ativa: true,
    recorrente: true,
    profissionalEstabelecimentoId: null,
    createAd: iso(-30),
    updatedAt: null,
  },
]

export const MOCK_PROGRESSO_METAS: MetaProgressoProfissional[] = [
  {
    profissionalEstabelecimentoId: 101,
    profissionalId: 101,
    nomePublico: 'Marina Alves',
    metaNome: 'Meta de Atendimentos - Marina',
    tipoMeta: 'Atendimentos',
    valorMeta: 80,
    percentualComissao: 5,
    quantidadeRealizada: 56,
    valorRealizado: null,
    percentualProgresso: 70,
    atingida: false,
  },
  {
    profissionalEstabelecimentoId: 102,
    profissionalId: 102,
    nomePublico: 'Carlos Mendes',
    metaNome: 'Meta de Faturamento - Carlos',
    tipoMeta: 'Faturamento',
    valorMeta: 8000,
    percentualComissao: 8,
    quantidadeRealizada: null,
    valorRealizado: 8240,
    percentualProgresso: 103,
    atingida: true,
  },
  {
    profissionalEstabelecimentoId: 103,
    profissionalId: 103,
    nomePublico: 'Patrícia Rocha',
    metaNome: 'Meta Lançamento - Patrícia',
    tipoMeta: 'Atendimentos',
    valorMeta: 50,
    percentualComissao: 4,
    quantidadeRealizada: 20,
    valorRealizado: null,
    percentualProgresso: 40,
    atingida: false,
  },
]

/* ---------- Comissões ---------- */

export const MOCK_COMISSOES: ComissaoProfissional[] = [
  { id: 1, profissionalEstabelecimentoId: 101, profissionalId: 101, nomePublico: 'Marina Alves', tipoComissao: 'Percentual', percentual: 10, valorFixo: null, ativo: true, inicioVigencia: iso(-90), fimVigencia: null },
  { id: 2, profissionalEstabelecimentoId: 102, profissionalId: 102, nomePublico: 'Carlos Mendes', tipoComissao: 'Percentual', percentual: 12, valorFixo: null, ativo: true, inicioVigencia: iso(-90), fimVigencia: null },
  { id: 3, profissionalEstabelecimentoId: 103, profissionalId: 103, nomePublico: 'Patrícia Rocha', tipoComissao: 'ValorFixo', percentual: null, valorFixo: 15, ativo: true, inicioVigencia: iso(-60), fimVigencia: null },
]

export const MOCK_EXTRATO_COMISSOES: ComissaoExtrato[] = [
  { lancamentoId: 1, agendamentoId: 10, valor: 12.5, descricao: 'Comissão - Corte de Cabelo (Marina)', criadoEm: iso(-1, 18) },
  { lancamentoId: 2, agendamentoId: 11, valor: 30, descricao: 'Comissão - Coloração (Carlos)', criadoEm: iso(-1, 16) },
  { lancamentoId: 3, agendamentoId: 12, valor: 15, descricao: 'Comissão - Manicure (Patrícia)', criadoEm: iso(-2, 11) },
]

/* ---------- Movimentos financeiros (entradas/saídas) ---------- */

function buildMovimento(id: number, direcao: 'entrada' | 'saida', descricao: string, valor: number, days: number, status: MovimentoFinanceiro['status']): MovimentoFinanceiro {
  return {
    id: String(id),
    direcao,
    valor,
    descricao,
    data: iso(-days, 12 + (id % 6)),
    status,
    origem: 'atendimento',
    formaPagamento: 'Pix',
    categoria: null,
    vencimento: null,
    agendamentoId: 10 + id,
    acoes: { podeMarcarRecebido: status === 'pendente', podeMarcarPago: status === 'pendente', podeEstornar: status === 'recebido' || status === 'pago' },
  }
}

export const MOCK_ENTRADAS: MovimentoFinanceiro[] = [
  buildMovimento(1, 'entrada', 'Atendimento - Corte de Cabelo', 60, 0, 'recebido'),
  buildMovimento(2, 'entrada', 'Atendimento - Coloração', 200, 1, 'recebido'),
  buildMovimento(3, 'entrada', 'Atendimento - Escova Modeladora', 45, 1, 'pendente'),
  buildMovimento(4, 'entrada', 'Atendimento - Manicure', 40, 2, 'recebido'),
  buildMovimento(5, 'entrada', 'Atendimento - Corte de Cabelo', 60, 3, 'recebido'),
  buildMovimento(6, 'entrada', 'Atendimento - Progressiva', 350, 4, 'pendente'),
]

export const MOCK_SAIDAS: MovimentoFinanceiro[] = [
  { id: 's1', direcao: 'saida', valor: 450, descricao: 'Fornecedor de produtos capilares', data: iso(-1), status: 'pago', origem: 'manual', formaPagamento: 'Pix', categoria: 'Fornecedor', vencimento: iso(-1), agendamentoId: null, acoes: { podeMarcarRecebido: false, podeMarcarPago: false, podeEstornar: true } },
  { id: 's2', direcao: 'saida', valor: 3000, descricao: 'Aluguel do salão', data: iso(-5), status: 'pago', origem: 'manual', formaPagamento: 'Transferência', categoria: 'Aluguel', vencimento: iso(-5), agendamentoId: null, acoes: { podeMarcarRecebido: false, podeMarcarPago: false, podeEstornar: true } },
  { id: 's3', direcao: 'saida', valor: 1800, descricao: 'Salário recepção', data: iso(-2), status: 'pendente', origem: 'manual', formaPagamento: 'Pix', categoria: 'Salário', vencimento: iso(0), agendamentoId: null, acoes: { podeMarcarRecebido: false, podeMarcarPago: true, podeEstornar: false } },
]

/* ---------- Contas a receber / pagar ---------- */

export const MOCK_CONTAS_RECEBER: ContaReceber[] = [
  { id: 1, estabelecimentoId: 1, agendamentoId: 14, descricao: 'Atendimento - Coloração', valor: 200, vencimento: iso(1), status: 'Pendente' },
  { id: 2, estabelecimentoId: 1, agendamentoId: 15, descricao: 'Atendimento - Progressiva', valor: 350, vencimento: iso(3), status: 'Pendente' },
]

export const MOCK_CONTAS_PAGAR: ContaPagar[] = [
  { id: 1, estabelecimentoId: 1, fornecedor: 'Distribuidora Beleza Pura', categoria: 'Fornecedor', descricao: 'Compra de shampoos', valor: 450, vencimento: iso(4), recorrente: false, status: 'Pendente' },
  { id: 2, estabelecimentoId: 1, fornecedor: 'Energia Elétrica', categoria: 'Outro', descricao: 'Conta de luz do mês', valor: 320, vencimento: iso(6), recorrente: true, status: 'Pendente' },
]

/* ---------- Conciliação ---------- */

export const MOCK_CONCILIACAO: ConciliacaoItem[] = [
  { id: 1, lancamentoCaixaId: 100, descricaoExtrato: 'PIX RECEBIDO - Glow Up', valorExtrato: 200, dataExtrato: iso(-1), conciliado: true },
  { id: 2, lancamentoCaixaId: null, descricaoExtrato: 'VENDAS DE CARTÃO - MERCADOPAGO', valorExtrato: 1050, dataExtrato: iso(-1), conciliado: false },
  { id: 3, lancamentoCaixaId: 101, descricaoExtrato: 'PIX RECEBIDO - Glow Up', valorExtrato: 60, dataExtrato: iso(-2), conciliado: true },
]

/* ---------- Caixa ---------- */

export const MOCK_CAIXA_RESUMO: CaixaResumo = {
  id: 1,
  estabelecimentoId: 1,
  saldoTotal: 12540.5,
  saldoDisponivel: 8340.5,
  saldoRetido: 4200,
}

export const MOCK_FINANCEIRO_RESUMO: FinanceiroResumo = {
  saldoTotal: 12540.5,
  saldoDisponivel: 8340.5,
  saldoRetido: 4200,
  entradasPeriodo: 13250,
  saidasPeriodo: 6450,
  totalLancamentosPeriodo: 86,
  periodoInicio: iso(-30),
  periodoFim: iso(0),
}

export const MOCK_DASHBOARD: FinanceiroDashboard = {
  saldoAtual: 8340.5,
  totalEntradas: 13250,
  totalSaidas: 6450,
  lucroLiquido: 6800,
  contasEmAberto: 2,
  quantidadeContasEmAberto: 2,
  comissoesPeriodo: 1245,
  periodoInicio: iso(-30),
  periodoFim: iso(0),
}

export const MOCK_LANCAMENTOS_CAIXA: LancamentoCaixa[] = [
  { id: 100, caixaId: 1, agendamentoId: 10, pagamentoId: 1, profissionalId: null, tipo: 'Entrada', valor: 60, descricao: 'Atendimento - Corte de Cabelo', criadoEm: iso(-1, 17) },
  { id: 101, caixaId: 1, agendamentoId: null, pagamentoId: null, profissionalId: null, tipo: 'Saida', valor: 450, descricao: 'Fornecedor de produtos', criadoEm: iso(-1, 15) },
  { id: 102, caixaId: 1, agendamentoId: 11, pagamentoId: 2, profissionalId: null, tipo: 'Entrada', valor: 200, descricao: 'Atendimento - Coloração', criadoEm: iso(-2, 16) },
]

export const MOCK_SESSAO_CAIXA: SessaoCaixa = {
  id: 1,
  caixaId: 1,
  usuarioId: 1,
  abertoEm: iso(0, 8),
  fechadoEm: null,
  saldoInicial: 200,
  saldoInformadoFechamento: null,
  diferenca: null,
  status: 'Aberto',
}

export const MOCK_FLUXO_CAIXA: FluxoCaixa = {
  saldoInicial: 200,
  dias: [
    { data: iso(-6), saldoInicialDia: 200, entradas: 900, saidas: 300, saldoFinalDia: 800 },
    { data: iso(-5), saldoInicialDia: 800, entradas: 1100, saidas: 3400, saldoFinalDia: -1500 },
    { data: iso(-4), saldoInicialDia: -1500, entradas: 700, saidas: 120, saldoFinalDia: -920 },
    { data: iso(-3), saldoInicialDia: -920, entradas: 1500, saidas: 300, saldoFinalDia: 280 },
    { data: iso(-2), saldoInicialDia: 280, entradas: 1200, saidas: 500, saldoFinalDia: 980 },
    { data: iso(-1), saldoInicialDia: 980, entradas: 850, saidas: 250, saldoFinalDia: 1580 },
    { data: iso(0), saldoInicialDia: 1580, entradas: 640, saidas: 0, saldoFinalDia: 2220 },
  ],
  saldoFinal: 2220,
  projecaoReceitaFutura: 4800,
}

export const MOCK_RELATORIO_ANALITICO: RelatorioAnalitico = {
  faturamentoTotal: 13250,
  atendimentosPagos: 86,
  ticketMedio: 154.07,
  porProfissional: [
    { profissionalId: 101, nomePublico: 'Marina Alves', faturamento: 5200, quantidade: 40 },
    { profissionalId: 102, nomePublico: 'Carlos Mendes', faturamento: 5200, quantidade: 26 },
    { profissionalId: 103, nomePublico: 'Patrícia Rocha', faturamento: 2850, quantidade: 20 },
  ],
  porFormaPagamento: [
    { formaPagamento: 'Pix', total: 8000, quantidade: 52 },
    { formaPagamento: 'Cartão', total: 4050, quantidade: 24 },
    { formaPagamento: 'Dinheiro', total: 1200, quantidade: 10 },
  ],
}

/* ---------- Gerenciador de metas de comissão (refatoração) ---------- */

function mesInicio(offset: number): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  d.setMonth(d.getMonth() + offset)
  return d.toISOString()
}

function mesFim(offset: number): string {
  const d = new Date()
  d.setHours(23, 59, 59, 0)
  d.setMonth(d.getMonth() + offset + 1, 0)
  return d.toISOString()
}

function diaRelativo(offset: number, hora = 10): string {
  const d = new Date()
  d.setHours(hora, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d.toISOString()
}

export const MOCK_COMISSAO_METAS: MetaComissaoProfissional[] = [
  {
    profissionalEstabelecimentoId: 101,
    profissionalId: 101,
    nomePublico: 'Marina Alves',
    avatarUrl: null,
    metaId: 1,
    nomeMeta: 'Meta de Atendimentos - Marina',
    tipoMeta: 'Atendimentos',
    valorMeta: 80,
    percentualComissao: 5,
    status: 'EmAndamento',
    dataInicio: mesInicio(0),
    dataFim: mesFim(0),
    quantidadeRealizada: 74,
    valorRealizado: null,
    percentualProgresso: 93,
    atingida: false,
  },
  {
    profissionalEstabelecimentoId: 102,
    profissionalId: 102,
    nomePublico: 'Carlos Mendes',
    avatarUrl: null,
    metaId: 2,
    nomeMeta: 'Meta de Faturamento - Carlos',
    tipoMeta: 'Faturamento',
    valorMeta: 8000,
    percentualComissao: 8,
    status: 'Concluida',
    dataInicio: mesInicio(0),
    dataFim: mesFim(0),
    quantidadeRealizada: null,
    valorRealizado: 8240,
    percentualProgresso: 103,
    atingida: true,
  },
  {
    profissionalEstabelecimentoId: 103,
    profissionalId: 103,
    nomePublico: 'Patrícia Rocha',
    avatarUrl: null,
    metaId: 3,
    nomeMeta: 'Meta de Atendimentos - Patrícia',
    tipoMeta: 'Atendimentos',
    valorMeta: 60,
    percentualComissao: 4,
    status: 'EmAndamento',
    dataInicio: mesInicio(0),
    dataFim: mesFim(0),
    quantidadeRealizada: 24,
    valorRealizado: null,
    percentualProgresso: 40,
    atingida: false,
  },
  {
    profissionalEstabelecimentoId: 104,
    profissionalId: 104,
    nomePublico: 'Bianca Costa',
    avatarUrl: null,
    metaId: 4,
    nomeMeta: 'Meta de Faturamento - Bianca',
    tipoMeta: 'Faturamento',
    valorMeta: 5000,
    percentualComissao: 6,
    status: 'Cancelada',
    dataInicio: mesInicio(-1),
    dataFim: mesFim(-1),
    quantidadeRealizada: null,
    valorRealizado: 2100,
    percentualProgresso: 42,
    atingida: false,
  },
]

export const MOCK_COMISSAO_EVOLUCAO: MetaComissaoEvolucaoItem[] = [
  { id: 1, data: diaRelativo(-20), descricao: 'Meta criada', quantidade: 0, valor: null },
  { id: 2, data: diaRelativo(-15), descricao: 'Atendimento concluído - Corte de Cabelo', quantidade: 1, valor: 60 },
  { id: 3, data: diaRelativo(-11), descricao: 'Atendimento concluído - Escova Modeladora', quantidade: 2, valor: 45 },
  { id: 4, data: diaRelativo(-6), descricao: 'Atendimento concluído - Corte de Cabelo', quantidade: 3, valor: 60 },
  { id: 5, data: diaRelativo(-2), descricao: 'Atendimento concluído - Design de Sobrancelhas', quantidade: 4, valor: 35 },
]

export function buildMetaNotificacoes(): MetaComissaoNotificacoes {
  return {
    concluidaEm: new Date().toISOString(),
    emailProfissionalEnviado: true,
    whatsAppProfissionalEnviado: true,
    lojaNotificada: true,
    logAuditoriaRegistrado: true,
  }
}

export function mockMetaComissaoDetalhe(metaId: number): MetaComissaoDetalhe {
  const base =
    MOCK_COMISSAO_METAS.find((m) => m.metaId === Number(metaId)) ?? MOCK_COMISSAO_METAS[0]
  const detalhe: MetaComissaoDetalhe = {
    ...base,
    criadoEm: mesInicio(-1),
    responsavelCriacao: 'Gustavo Souza',
    evolucao:
      base.status === 'Concluida'
        ? [...MOCK_COMISSAO_EVOLUCAO, { id: 99, data: new Date().toISOString(), descricao: 'Meta concluída — notificações enviadas', quantidade: base.quantidadeRealizada ?? 0, valor: base.valorRealizado ?? null }]
        : MOCK_COMISSAO_EVOLUCAO,
  }
  // Meta concluída → carrega a automação de conclusão (e-mail, WhatsApp, loja, log).
  if (base.status === 'Concluida') {
    detalhe.notificacoes = buildMetaNotificacoes()
  }
  return detalhe
}

/**
 * Conclui a meta no estado da sessão (mock): marca Concluída, 100% e "atingida".
 * O detalhe subsequente passa a incluir as notificações de conclusão.
 */
export function concluirMetaComissao(metaId: number): MetaComissaoProfissional | null {
  const meta = MOCK_COMISSAO_METAS.find((m) => m.metaId === Number(metaId))
  if (!meta) return null
  meta.status = 'Concluida'
  meta.atingida = true
  meta.percentualProgresso = 100
  return meta
}
