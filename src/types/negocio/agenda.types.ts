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

export interface AgendaFiltro {
  profissionalId?: number
  clienteId?: number
  status?: string
  inicio?: string
  fim?: string
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
