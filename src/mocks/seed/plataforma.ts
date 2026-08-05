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

const MODULOS_TODOS = [
  'Estabelecimento', 'Assinatura', 'Agenda', 'Servicos', 'HorariosAtendimento',
  'Caixa', 'Financeiro', 'ComissaoProfissionais', 'Clientes', 'Profissionais', 'WhatsApp',
]

const MOCK_PLANOS: Plano[] = [
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
    nome: 'Plus',
    descricao: 'Gestão completa do salão em uma única loja.',
    preco: 79.9,
    periodo: 'mensal',
    limiteProfissionais: 10,
    limiteServicos: null,
    limiteAgendamentos: null,
    limiteUsuarios: 10,
    limiteAgendamentosPorDia: null,
    limiteEstabelecimentos: 1,
    prioridadeListagemPublica: true,
    modulos: MODULOS_TODOS,
    funcionalidades: ['Agenda ilimitada', 'Comissões por metas', 'Relatórios financeiros', 'Vitrine pública'],
  },
  {
    id: 3,
    nome: 'Premium',
    descricao: 'Para redes com múltiplas unidades.',
    preco: 159.9,
    periodo: 'mensal',
    limiteProfissionais: null,
    limiteServicos: null,
    limiteAgendamentos: null,
    limiteUsuarios: null,
    limiteAgendamentosPorDia: null,
    limiteEstabelecimentos: 5,
    prioridadeListagemPublica: true,
    modulos: MODULOS_TODOS,
    funcionalidades: ['Tudo do Plus', 'Múltiplas unidades', 'Relatório de rede', 'Suporte prioritário'],
  },
]

export const MOCK_PLANOS_RESPONSE: PlanosResponse = {
  planos: MOCK_PLANOS,
  promocaoLancamento: {
    disponivel: true,
    vagasRestantes: 15,
    diasTrial: 14,
    percentualDescontoMensalidade: 20,
    diasAntecedenciaAlertaFatura: 3,
    diasAntecedenciaGeracaoCobranca: 1,
    diasToleranciaInadimplencia: 5,
  },
}

/* ---------- Categorias de estabelecimento ---------- */

export const MOCK_CATEGORIAS_ESTABELECIMENTO = [
  { id: 1, nome: 'Barbearia', slug: 'barbearia' },
  { id: 2, nome: 'Salão de Beleza', slug: 'salao-de-beleza' },
  { id: 3, nome: 'Clínica de Estética', slug: 'clinica-de-estetica' },
  { id: 4, nome: 'Esmalteria', slug: 'esmalteria' },
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
  categoriaId: 2,
  categoria: 'Salão de Beleza',
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
  planoId: 1,
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
  { id: 1, valor: 79.9, status: 'Pago', moeda: 'BRL', tipoCobranca: 'Mensalidade', numeroCiclo: 3, dataVencimento: iso(-30), dataGeracao: iso(-32), cicloInicio: iso(-30), cicloFim: iso(0), gatewayPaymentId: 'PAY-0001', pagoEm: iso(-30) },
  { id: 2, valor: 79.9, status: 'Pago', moeda: 'BRL', tipoCobranca: 'Mensalidade', numeroCiclo: 2, dataVencimento: iso(-60), dataGeracao: iso(-62), cicloInicio: iso(-60), cicloFim: iso(-30), gatewayPaymentId: 'PAY-0002', pagoEm: iso(-59) },
]

/* ---------- Convites ---------- */

export const MOCK_CONVITES: ConviteNegocio[] = [
  { id: 1, estabelecimentoId: 1, email: 'novo.profissional@gmail.com', tipoConvite: 'Profissional', roleSugerida: 'Profissional', status: 'Pendente', expiraEm: iso(7), criadoEm: iso(-2) },
  { id: 2, estabelecimentoId: 1, email: 'admin.novo@glowup.com.br', tipoConvite: 'UsuarioEquipe', roleSugerida: 'Admin', status: 'Aceito', expiraEm: iso(3), criadoEm: iso(-8) },
]

export function mockConvitePreview(_token: string): ConvitePreview {
  return {
    estabelecimentoId: 1,
    nomeEstabelecimento: 'Studio Glow Up',
    email: 'novo.profissional@gmail.com',
    tipoConvite: 'Profissional',
    roleSugerida: 'Profissional',
    status: 'Pendente',
    expiraEm: iso(7),
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
