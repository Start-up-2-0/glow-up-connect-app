export interface AgendaGeralItem {
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

export interface AgendaGeral {
  id: number
  usuarioClienteId: number | null
  clienteNome: string
  clienteEmail: string | null
  clienteTelefone: string | null
  status: string
  valorTotal: number
  inicio: string
  fim: string
  observacao: string | null
  itens: AgendaGeralItem[]
}

export interface AgendaProfissional {
  agendamentoItemId: number
  agendamentoId: number
  usuarioClienteId: number | null
  clienteNome: string
  clienteEmail: string | null
  clienteTelefone: string | null
  servicoId: number
  servicoNome: string
  inicio: string
  fim: string
  status: string
  agendamentoStatus: string
}

export type AgendaOrdenacao =
  | 'atendimento_desc'
  | 'atendimento_asc'
  | 'criacao_desc'
  | 'criacao_asc'

export interface AgendaCustomDateRange {
  inicio: string
  fim: string
}

export const EMPTY_AGENDA_CUSTOM_DATE_RANGE: AgendaCustomDateRange = { inicio: '', fim: '' }

export interface AgendaFiltro {
  profissionalId?: number
  clienteId?: number
  status?: string
  inicio?: string
  fim?: string
  pagina?: number
  tamanhoPagina?: number
  ordenacao?: AgendaOrdenacao | string
  /** Quando true, a API valida limite de data atual e intervalo de 1 ano. */
  intervaloPersonalizado?: boolean
}

export interface AgendaPaginada<T> {
  total: number
  pagina: number
  tamanhoPagina: number
  itens: T[]
}

export interface AgendamentoHistorico {
  id: number
  usuarioExecutorId: number | null
  usuarioExecutorNome: string | null
  statusAnterior: string
  statusNovo: string
  motivo: string | null
  criadoEm: string
}
