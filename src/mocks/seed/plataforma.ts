import type { Plano, PlanosResponse } from '@/types/plano.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import type { Assinatura, CobrancaAssinatura } from '@/types/assinatura.types'
import type { ConviteNegocio, ConvitePreview } from '@/types/convite.types'
import type { AuditoriaRegistro } from '@/services/auditoriaService'
import type { RedeResumo } from '@/services/redeService'

function iso(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}

/* ---------- Planos ---------- */

const MODULOS_ESTABELECIMENTO_ESSENCIAL = [
  'Estabelecimento', 'Assinatura', 'Agenda', 'Servicos', 'HorariosAtendimento',
  'Notificacoes', 'Email', 'Profissionais', 'WhatsApp',
]

const MODULOS_ESTABELECIMENTO_PREMIUM = [
  ...MODULOS_ESTABELECIMENTO_ESSENCIAL,
  'Caixa', 'Financeiro', 'ComissaoProfissionais', 'Clientes',
]

const MODULOS_AUTONOMO_ESSENCIAL = [
  'Estabelecimento', 'Assinatura', 'Agenda', 'Servicos', 'HorariosAtendimento',
  'Notificacoes', 'Email', 'Clientes', 'ProfissionalAutonomo',
]

const MODULOS_AUTONOMO_PREMIUM = [
  ...MODULOS_AUTONOMO_ESSENCIAL,
  'WhatsApp', 'Caixa', 'Financeiro',
]

const FUNCIONALIDADES_ESTABELECIMENTO_ESSENCIAL = [
  'Operação completa para uma unidade',
  'Agenda compartilhada',
  'Gestão de profissionais',
  'WhatsApp e e-mail',
]

const FUNCIONALIDADES_ESTABELECIMENTO_PREMIUM = [
  ...FUNCIONALIDADES_ESTABELECIMENTO_ESSENCIAL,
  'Até 5 unidades na mesma assinatura',
  'Caixa e financeiro',
  'Comissão automática',
  'Prioridade no marketplace',
]

const FUNCIONALIDADES_AUTONOMO_ESSENCIAL = [
  'Agenda pessoal',
  'Cadastro de serviços',
  'Perfil profissional público',
  'Gestão de clientes',
]

const FUNCIONALIDADES_AUTONOMO_PREMIUM = [
  ...FUNCIONALIDADES_AUTONOMO_ESSENCIAL,
  'WhatsApp automático',
  'Caixa pessoal',
  'Relatórios financeiros',
  'Prioridade no marketplace',
]

/** Preços alinhados a `PlanoComercialCatalogo` (API). */
const PRECO_LOJA_ESSENCIAL = 79.9
const PRECO_LOJA_PREMIUM = 199.9
const PRECO_AUTONOMO_ESSENCIAL = 49.99
const PRECO_AUTONOMO_PREMIUM = 79.99

function buildMockPlanos(tipoAssinatura: 'Estabelecimento' | 'ProfissionalAutonomo'): Plano[] {
  const ehAutonomo = tipoAssinatura === 'ProfissionalAutonomo'

  return [
    {
      id: 1,
      nome: 'Básico',
      descricao: 'Para começar com o essencial da agenda.',
      preco: 0,
      periodo: 'mensal',
      limiteProfissionais: 3,
      limiteServicos: 30,
      limiteAgendamentos: 100,
      limiteUsuarios: 3,
      limiteAgendamentosPorDia: 20,
      limiteEstabelecimentos: 1,
      prioridadeListagemPublica: false,
      modulos: ['Agenda', 'Servicos', 'HorariosAtendimento'],
      funcionalidades: ['Agenda', 'Gestão de serviços'],
    },
    {
      id: 2,
      nome: 'Essencial',
      descricao: ehAutonomo
        ? 'Operação completa para profissional autônomo.'
        : 'Operação completa para uma unidade.',
      preco: ehAutonomo ? PRECO_AUTONOMO_ESSENCIAL : PRECO_LOJA_ESSENCIAL,
      periodo: 'mensal',
      limiteProfissionais: ehAutonomo ? 1 : 10,
      limiteServicos: null,
      limiteAgendamentos: null,
      limiteUsuarios: ehAutonomo ? 1 : 10,
      limiteAgendamentosPorDia: null,
      limiteEstabelecimentos: 1,
      prioridadeListagemPublica: !ehAutonomo,
      modulos: ehAutonomo
        ? [...MODULOS_AUTONOMO_ESSENCIAL]
        : [...MODULOS_ESTABELECIMENTO_ESSENCIAL],
      funcionalidades: ehAutonomo
        ? [...FUNCIONALIDADES_AUTONOMO_ESSENCIAL]
        : [...FUNCIONALIDADES_ESTABELECIMENTO_ESSENCIAL],
    },
    {
      id: 3,
      nome: 'Premium',
      descricao: ehAutonomo
        ? 'Recursos avançados para o profissional autônomo.'
        : 'Para redes com múltiplas unidades.',
      preco: ehAutonomo ? PRECO_AUTONOMO_PREMIUM : PRECO_LOJA_PREMIUM,
      periodo: 'mensal',
      limiteProfissionais: ehAutonomo ? 1 : null,
      limiteServicos: null,
      limiteAgendamentos: null,
      limiteUsuarios: ehAutonomo ? 1 : null,
      limiteAgendamentosPorDia: null,
      limiteEstabelecimentos: ehAutonomo ? 1 : 5,
      prioridadeListagemPublica: true,
      modulos: ehAutonomo
        ? [...MODULOS_AUTONOMO_PREMIUM]
        : [...MODULOS_ESTABELECIMENTO_PREMIUM],
      funcionalidades: ehAutonomo
        ? [...FUNCIONALIDADES_AUTONOMO_PREMIUM]
        : [...FUNCIONALIDADES_ESTABELECIMENTO_PREMIUM],
    },
  ]
}

const MOCK_PROMOCAO_LANCAMENTO = {
  disponivel: true,
  vagasRestantes: 15,
  diasTrial: 14,
  percentualDescontoMensalidade: 50,
  diasAntecedenciaAlertaFatura: 3,
  diasAntecedenciaGeracaoCobranca: 1,
  diasToleranciaInadimplencia: 5,
}

/** @deprecated Prefer `mockPlanosResponse(tipo)`. Mantido para seeds que esperam o catálogo de loja. */
export const MOCK_PLANOS_RESPONSE: PlanosResponse = {
  planos: buildMockPlanos('Estabelecimento'),
  promocaoLancamento: MOCK_PROMOCAO_LANCAMENTO,
}

export function mockPlanosResponse(
  tipoAssinatura: 'Estabelecimento' | 'ProfissionalAutonomo' = 'Estabelecimento',
): PlanosResponse {
  return {
    planos: buildMockPlanos(tipoAssinatura),
    promocaoLancamento: MOCK_PROMOCAO_LANCAMENTO,
  }
}

/* ---------- Categorias de estabelecimento ---------- */

export const MOCK_CATEGORIAS_ESTABELECIMENTO = [
  {
    id: 1,
    nome: 'Barbearia',
    slug: 'barbearia',
    tipoAssinatura: 'Estabelecimento' as const,
  },
  {
    id: 18,
    nome: 'Salão de Beleza',
    slug: 'salao-de-beleza',
    tipoAssinatura: 'Estabelecimento' as const,
  },
  {
    id: 2,
    nome: 'Barbeiro',
    slug: 'barbeiro',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 3,
    nome: 'Cabeleireiro(a)',
    slug: 'cabeleireiro',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 4,
    nome: 'Barbeiro(a)',
    slug: 'barbeiro-a',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 5,
    nome: 'Manicure / Pedicure',
    slug: 'manicure-pedicure',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 6,
    nome: 'Designer de Sobrancelhas',
    slug: 'designer-de-sobrancelhas',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 7,
    nome: 'Lash Designer',
    slug: 'lash-designer',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 8,
    nome: 'Maquiador(a)',
    slug: 'maquiador',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 9,
    nome: 'Esteticista',
    slug: 'esteticista',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 10,
    nome: 'Massoterapeuta',
    slug: 'massoterapeuta',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 11,
    nome: 'Trancista',
    slug: 'trancista',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 12,
    nome: 'Nail Designer',
    slug: 'nail-designer',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 13,
    nome: 'Depilador(a)',
    slug: 'depilador',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 14,
    nome: 'Especialista em Limpeza de Pele',
    slug: 'especialista-em-limpeza-de-pele',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 15,
    nome: 'Micropigmentador(a)',
    slug: 'micropigmentador',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 16,
    nome: 'Piercer',
    slug: 'piercer',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
  {
    id: 17,
    nome: 'Podólogo(a)',
    slug: 'podologo',
    tipoAssinatura: 'ProfissionalAutonomo' as const,
  },
] as const

export function mockCategoriasEstabelecimento() {
  return MOCK_CATEGORIAS_ESTABELECIMENTO
}

/* ---------- Estabelecimento (perfil) ---------- */

export const MOCK_PERFIL_ESTABELECIMENTO: EstabelecimentoPerfilCompleto = {
  id: 1,
  publicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2',
  nome: 'Studio Glow Up',
  descricao: 'Salão de beleza especializado em cabelos, unhas e sobrancelhas.',
  logo: '',
  telefone: '(79) 3200-0000',
  email: 'contato@studioglowup.com.br',
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  categoriaId: 1,
  categoria: 'Barbearia',
  endereco: {
    cep: '49020-000',
    logradouro: 'Av. das Acácias',
    numero: '250',
    bairro: 'Centro',
    cidade: 'Aracaju',
    estado: 'SE',
    complemento: 'Sala 2',
    enderecoCompleto: true,
  },
}

/* ---------- Assinatura ---------- */

export const MOCK_ASSINATURA: Assinatura = {
  id: 1,
  planoId: 3,
  estabelecimentoId: 1,
  status: 'Ativa',
  gateway: 'MercadoPago',
  inicio: iso(-90),
  fim: null,
  canceladoEm: null,
  dataReferenciaCiclo: iso(0),
  proximaDataVencimento: iso(33),
  proximaDataGeracaoCobranca: iso(31),
  proximaDataAlerta: iso(28),
  emTrial: false,
  diasTrial: 0,
  percentualDescontoPermanente: 20,
  pagamentoInicial: null,
  requerConfirmacaoEmail: false,
}

export const MOCK_COBRANCAS: CobrancaAssinatura[] = [
  { id: 1, valor: 159.9, status: 'Pago', moeda: 'BRL', tipoCobranca: 'Mensalidade', numeroCiclo: 3, dataVencimento: iso(-30), dataGeracao: iso(-32), cicloInicio: iso(-30), cicloFim: iso(0), gatewayPaymentId: 'PAY-0001', pagoEm: iso(-30) },
  { id: 2, valor: 159.9, status: 'Pago', moeda: 'BRL', tipoCobranca: 'Mensalidade', numeroCiclo: 2, dataVencimento: iso(-60), dataGeracao: iso(-62), cicloInicio: iso(-60), cicloFim: iso(-30), gatewayPaymentId: 'PAY-0002', pagoEm: iso(-59) },
]

/* ---------- Convites ---------- */

export const MOCK_CONVITES: ConviteNegocio[] = [
  {
    id: 1,
    estabelecimentoId: 1,
    tipoConvite: 'Profissional',
    roleSugerida: 'Profissional',
    status: 'Ativo',
    limiteUsuarios: 2,
    quantidadeUtilizacoes: 0,
    expiraEm: iso(1),
    criadoEm: iso(-2),
  },
  {
    id: 2,
    estabelecimentoId: 1,
    tipoConvite: 'UsuarioEquipe',
    roleSugerida: 'Admin',
    status: 'Esgotado',
    limiteUsuarios: 1,
    quantidadeUtilizacoes: 1,
    expiraEm: iso(3),
    criadoEm: iso(-8),
  },
  {
    id: 3,
    estabelecimentoId: 1,
    tipoConvite: 'Profissional',
    roleSugerida: 'Profissional',
    status: 'Cancelado',
    limiteUsuarios: 1,
    quantidadeUtilizacoes: 0,
    expiraEm: iso(2),
    criadoEm: iso(-10),
  },
]

export const MOCK_LINK_CONVITE_ATIVO =
  'https://glow-up-connect-app-staging.up.railway.app/convite/11111111-1111-1111-1111-111111111111'

export function mockConvitePreview(_token: string): ConvitePreview {
  return {
    estabelecimentoId: 1,
    nomeEstabelecimento: 'Studio Glow Up',
    roleSugerida: 'Profissional',
    status: 'Ativo',
    limiteUsuarios: 2,
    quantidadeUtilizacoes: 0,
    vagasRestantes: 2,
    expiraEm: iso(1),
  }
}

/* ---------- Rede ---------- */

export const MOCK_REDE: RedeResumo = {
  assinaturaId: 1,
  totalUnidades: 2,
  limiteUnidades: 5,
  totalAgendamentosNoPeriodo: 210,
  totalFaturamentoPeriodo: 28900,
  unidades: [
    { estabelecimentoId: 1, nome: 'Studio Glow Up', ehMatriz: true, agendamentosNoPeriodo: 140, faturamentoPeriodo: 18400 },
    { estabelecimentoId: 2, nome: 'Glow Up Filial Centro', ehMatriz: false, agendamentosNoPeriodo: 70, faturamentoPeriodo: 10500 },
  ],
}

/* ---------- Auditoria ---------- */

export const MOCK_AUDITORIA: AuditoriaRegistro[] = [
  { id: 1, estabelecimentoId: 1, usuarioId: 1, tipoAcao: 'MetaCriada', entidade: 'Meta', entidadeId: 1, payloadJson: '{"nome":"Meta de Atendimentos - Marina"}', criadoEm: iso(-25) },
  { id: 2, estabelecimentoId: 1, usuarioId: 1, tipoAcao: 'ComissaoAtualizada', entidade: 'Comissao', entidadeId: 1, payloadJson: '{"percentual":10}', criadoEm: iso(-18) },
  { id: 3, estabelecimentoId: 1, usuarioId: 2, tipoAcao: 'AgendamentoConfirmado', entidade: 'Agendamento', entidadeId: 10, payloadJson: '{"status":"Confirmado"}', criadoEm: iso(-1) },
  { id: 4, estabelecimentoId: 1, usuarioId: null, tipoAcao: 'MetaConcluida', entidade: 'Meta', entidadeId: 2, payloadJson: '{"status":"Concluida","notificacoes":{"email":true,"whatsapp":true,"loja":true}}', criadoEm: iso(-6) },
]

/* ---------- Privacidade ---------- */

export const MOCK_DADOS_PRIVACIDADE = {
  usuario: { id: 1, nome: 'Gustavo Souza', email: 'gustavo@glowup.com.br' },
  estabelecimentos: ['Studio Glow Up', 'Glow Up Filial Centro'],
  totalDados: 42,
}
