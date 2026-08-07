import type { AgendamentoCliente, AgendamentoClienteItem } from '@/types/agendamento.types'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import type { ClienteRelacionamento, TimelineGroup } from '@/utils/dashboardClienteUtils'
import type { ReceitaDia } from '@/utils/dashboardNegocioUtils'

/** Payload da API (quantidade); o composable mapeia para DistribuicaoServico.count. */
export interface DashboardNegocioDistribuicaoServico {
  nome: string
  quantidade: number
}

export interface DashboardClienteResponse {
  totalGastoMes: number
  totalGastoMesAnterior: number
  atendimentosMes: number
  totalAgendamentos: number
  proximoAgendamento: AgendamentoCliente | null
  historicoTimeline: TimelineGroup[]
  relacionamento: ClienteRelacionamento
}

export interface DashboardNegocioProfissional {
  id: number
  profissionalId: number
  nomePublico: string
  ativo: boolean
  podeReceberAgendamento: boolean
  notaMedia?: number | null
  agendamentosHoje: number
}

export interface DashboardNegocioResponse {
  totalGanhoMes: number
  totalGanhoMesAnterior: number
  totalGanhoHoje: number
  totalGanhoSemana: number
  totalGanhoSemanaAnterior: number
  agendamentosHoje: number
  agendamentosOntem: number
  agendamentosSemana: number
  cancelamentosHoje: number
  clientesAtivos: number
  servicosAtivos: number
  profissionais: DashboardNegocioProfissional[]
  ultimosAtendimentos: AgendaGeral[]
  proximosAtendimentos: AgendaGeral[]
  avaliacaoResumo: AvaliacaoResumoPublico | null
  receitaUltimos7Dias: ReceitaDia[]
  receitaUltimos30Dias: ReceitaDia[]
  distribuicaoServicos: DashboardNegocioDistribuicaoServico[]
}

/** Compat: API pode omitir campos opcionais do AgendamentoCliente. */
export type DashboardAgendamentoLean = Pick<
  AgendamentoCliente,
  | 'id'
  | 'status'
  | 'valorTotal'
  | 'inicio'
  | 'fim'
  | 'estabelecimentoPublicGuid'
  | 'estabelecimentoNome'
  | 'estabelecimentoLogo'
> & {
  endereco?: AgendamentoCliente['endereco']
  itens: AgendamentoClienteItem[]
}
