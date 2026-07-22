import type { AgendaGeral } from '@/types/negocio/agenda.types'
import type { MovimentoFinanceiro } from '@/types/negocio/financeiro.types'
import { calcularVariacaoPercentual } from '@/utils/financeiroDashboard'

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface ReceitaDia {
  date: string
  label: string
  value: number
}

export interface DistribuicaoServico {
  nome: string
  count: number
}

export interface AgendaTimelineItem {
  id: string
  horario: string
  label: string
  tipo: 'agendamento' | 'livre'
  status?: string
}

export interface DashboardInsight {
  id: string
  icon: 'calendar' | 'money' | 'star' | 'users'
  tone: 'neutral' | 'positive' | 'warning' | 'info'
  message: string
}

export function agruparEntradasPorDia(
  entradas: MovimentoFinanceiro[],
  dias: number,
): ReceitaDia[] {
  const map = new Map<string, number>()
  const labels = new Map<string, string>()

  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateOnly(d)
    map.set(key, 0)
    labels.set(
      key,
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
    )
  }

  for (const entrada of entradas) {
    const key = entrada.data.slice(0, 10)
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + entrada.valor)
    }
  }

  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    label: labels.get(date) ?? date,
    value,
  }))
}

export function contarAgendamentosPorProfissional(
  agendamentos: AgendaGeral[],
): Map<number, number> {
  const map = new Map<number, number>()
  for (const ag of agendamentos) {
    for (const item of ag.itens) {
      map.set(item.profissionalId, (map.get(item.profissionalId) ?? 0) + 1)
    }
  }
  return map
}

export function agregarDistribuicaoServicos(agendamentos: AgendaGeral[]): DistribuicaoServico[] {
  const map = new Map<string, number>()
  for (const ag of agendamentos) {
    for (const item of ag.itens) {
      map.set(item.servicoNome, (map.get(item.servicoNome) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

export function montarTimelineAgenda(
  agendamentos: AgendaGeral[],
  formatTime: (iso: string) => string,
): AgendaTimelineItem[] {
  const sorted = [...agendamentos].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  )

  const timeline: AgendaTimelineItem[] = []
  let previousEnd: Date | null = null

  for (const ag of sorted) {
    const inicio = new Date(ag.inicio)
    if (previousEnd) {
      const gapMin = (inicio.getTime() - previousEnd.getTime()) / 60000
      if (gapMin >= 30) {
        timeline.push({
          id: `livre-${previousEnd.toISOString()}`,
          horario: formatTime(previousEnd.toISOString()),
          label: 'Livre',
          tipo: 'livre',
        })
      }
    }

    timeline.push({
      id: String(ag.id),
      horario: formatTime(ag.inicio),
      label: ag.clienteNome,
      tipo: 'agendamento',
      status: ag.status,
    })
    previousEnd = new Date(ag.fim)
  }

  return timeline.slice(0, 8)
}

export function calcularTaxaOcupacao(
  agendamentosHoje: number,
  profissionaisAtivos: number,
): number | null {
  if (profissionaisAtivos <= 0) return null
  const capacidadeEstimada = profissionaisAtivos * 8
  return Math.min(100, Math.round((agendamentosHoje / capacidadeEstimada) * 100))
}

export function gerarInsights(params: {
  agendamentosHoje: number
  variacaoReceitaMes: number | null
  variacaoAgendamentos: number | null
  avaliacaoResumo: { notaMedia: number; totalAvaliacoes: number } | null
  proximosAtendimentos: AgendaGeral[]
  totalGanhoSemana: number
  totalGanhoSemanaAnterior: number
}): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  const horariosLivres = Math.max(0, 8 - params.agendamentosHoje)
  if (params.agendamentosHoje >= 0) {
    insights.push({
      id: 'agenda-hoje',
      icon: 'calendar',
      tone: 'info',
      message:
        params.agendamentosHoje === 0
          ? 'Nenhum agendamento para hoje. Divulgue horários disponíveis.'
          : horariosLivres > 0
            ? `Você tem ${horariosLivres} horário${horariosLivres > 1 ? 's' : ''} ainda disponível${horariosLivres > 1 ? 'is' : ''} hoje.`
            : 'Agenda cheia hoje — considere abrir encaixes ou remarcações.',
    })
  }

  if (params.variacaoReceitaMes != null) {
    const caiu = params.variacaoReceitaMes < 0
    insights.push({
      id: 'receita-mes',
      icon: 'money',
      tone: caiu ? 'warning' : 'positive',
      message: caiu
        ? `Sua receita caiu ${Math.abs(Math.round(params.variacaoReceitaMes))}% em relação ao mês passado.`
        : `Sua receita cresceu ${Math.round(params.variacaoReceitaMes)}% em relação ao mês passado.`,
    })
  } else if (params.totalGanhoSemana === 0 && params.totalGanhoSemanaAnterior === 0) {
    insights.push({
      id: 'receita-vazia',
      icon: 'money',
      tone: 'neutral',
      message: 'Registre atendimentos e entradas para acompanhar o faturamento.',
    })
  }

  if (params.avaliacaoResumo) {
    insights.push({
      id: 'avaliacoes',
      icon: 'star',
      tone: 'neutral',
      message:
        params.avaliacaoResumo.totalAvaliacoes === 0
          ? 'Nenhuma avaliação registrada ainda. Incentive clientes após o atendimento.'
          : `Nota média ${params.avaliacaoResumo.notaMedia.toFixed(1)} com ${params.avaliacaoResumo.totalAvaliacoes} avaliações.`,
    })
  }

  if (params.variacaoAgendamentos != null) {
    const subiu = params.variacaoAgendamentos >= 0
    insights.push({
      id: 'agenda-trend',
      icon: 'users',
      tone: subiu ? 'positive' : 'warning',
      message: subiu
        ? `Agendamentos de hoje ${Math.round(params.variacaoAgendamentos)}% acima de ontem.`
        : `Agendamentos de hoje ${Math.abs(Math.round(params.variacaoAgendamentos))}% abaixo de ontem.`,
    })
  }

  return insights.slice(0, 4)
}

export { calcularVariacaoPercentual }
