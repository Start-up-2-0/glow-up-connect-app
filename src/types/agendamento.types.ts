import type { EnderecoResumo, EstabelecimentoPublico } from '@/types/estabelecimento.types'

export type AgendamentoStatus =
  | 'PendentePagamento'
  | 'Confirmado'
  | 'EmAtendimento'
  | 'Concluido'
  | 'Cancelado'
  | 'Expirado'
  | 'Reembolsado'
  | 'PendenteConfirmacao'
  | 'Remarcado'
  | 'NaoCompareceu'

export type AgendamentoOrdenacao =
  | 'proximos'
  | 'recentes'
  | 'atendimento_desc'
  | 'atendimento_asc'
  | 'criacao_desc'
  | 'criacao_asc'

export interface AgendamentoClienteItem {
  id: number
  servicoId: number
  servicoNome: string
  profissionalId: number
  profissionalNome: string
  inicio: string
  fim: string
  valor: number
  status: string
}

export interface AgendamentoCliente {
  id: number
  status: AgendamentoStatus | string
  valorTotal: number
  duracaoTotalMinutos: number
  inicio: string
  fim: string
  estabelecimentoPublicGuid: string
  estabelecimentoNome: string
  estabelecimentoLogo: string
  endereco: EnderecoResumo | null
  observacao: string
  origem: string
  createAd: string
  canceladoEm: string | null
  itens: AgendamentoClienteItem[]
}

export interface AgendamentosPaginados {
  total: number
  pagina: number
  tamanhoPagina: number
  itens: AgendamentoCliente[]
}

export interface AgendamentoFiltro {
  status?: AgendamentoStatus | string
  dataInicio?: string
  dataFim?: string
  estabelecimentoPublicGuid?: string
  pagina?: number
  tamanhoPagina?: number
  ordenacao?: AgendamentoOrdenacao
  /** Quando true, a API valida limite de data atual e intervalo de 1 ano. */
  intervaloPersonalizado?: boolean
}

export interface CriarAgendamentoPayload {
  estabelecimentoPublicGuid: string
  profissionalPublicGuid?: string
  servicoIds: number[]
  data: string
  horarioInicio: string
  inicioSelecionado?: string
  observacao?: string
}

export interface CriarAgendamentoPublicoPayload {
  profissionalPublicGuid?: string
  servicoIds: number[]
  data: string
  horarioInicio: string
  inicioSelecionado?: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
  observacao?: string
}

export interface AgendamentoCriado {
  id: number
  status: string
  valorTotal: number
  duracaoTotalMinutos: number
  inicio: string
  fim: string
}

export interface AgendamentoContextoPublico {
  estabelecimento: EstabelecimentoPublico
  profissional: ProfissionalPublico
  podeReceberAgendamento: boolean
}

export interface CriarAgendamentoComCadastroPayload {
  profissionalPublicGuid: string
  servicoIds: number[]
  data: string
  horarioInicio: string
  inicioSelecionado?: string
  observacao?: string
  cadastro: {
    nome: string
    email: string
    telefone: string
    senha: string
  }
}

export interface PropostaRemarcacao {
  id: number
  agendamentoId: number
  status: string
  dataSugerida: string
  horarioInicioSugerido: string
  motivo: string
  inicioAtual: string | null
  estabelecimentoNome: string | null
  profissionalNome: string | null
  tokenPublico: string
  expiraEm: string
}

export interface CancelarAgendamentoPayload {
  motivo: string
}

export interface RemarcarAgendamentoPayload {
  data: string
  horarioInicio: string
  inicioSelecionado?: string
  motivo: string
}

export interface ServicoPublico {
  id: number
  nome: string
  descricao: string
  precoMinimo: number
  precoMaximo: number
  duracaoMinutosBase: number
  duracaoMinutosEstimada: number
}

export interface ProfissionalPublico {
  publicGuid: string
  nomePublico: string
}

export interface SlotDisponivel {
  profissionalId: number
  inicio: string
  fim: string
}

export interface DisponibilidadeAgenda {
  servicoId: number
  servicoIds: number[]
  duracaoMinutos: number
  mensagemIndisponibilidade: string | null
  datasAtendimento: string[]
  slots: SlotDisponivel[]
}

export interface ConsultarDisponibilidadeParams {
  dataInicio: string
  dataFim: string
  servicoIds: number[]
  profissionalId?: number
  profissionalPublicGuid?: string
}

export const AGENDAMENTO_STATUS_CANCELAVEL: readonly string[] = [
  'PendenteConfirmacao',
  'Confirmado',
  'Remarcado',
  'EmAtendimento',
]

export const AGENDAMENTO_STATUS_REMARCAVEL: readonly string[] = [
  'PendenteConfirmacao',
  'Confirmado',
  'Remarcado',
]
