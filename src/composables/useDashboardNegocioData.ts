import { computed, ref } from 'vue'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { avaliacaoService } from '@/services/avaliacaoService'
import { clienteNegocioService } from '@/services/clienteNegocioService'
import { equipeService } from '@/services/equipeService'
import { financeiroService } from '@/services/financeiroService'
import { servicoService } from '@/services/servicoService'
import { useNegocioContext } from '@/composables/useNegocioContext'
import {
  getHojeRange,
  getMesAnteriorRange,
  getMesAtualRange,
  getOntemRange,
  getSemanaAtualRange,
  getUltimos30DiasRange,
  getUltimos7DiasRange,
} from '@/utils/dashboardDateRange'
import {
  agruparEntradasPorDia,
  agregarDistribuicaoServicos,
  calcularTaxaOcupacao,
  calcularVariacaoPercentual,
  gerarInsights,
  montarTimelineAgenda,
  type AgendaTimelineItem,
  type DashboardInsight,
  type DistribuicaoServico,
  type ReceitaDia,
} from '@/utils/dashboardNegocioUtils'
import { formatTime } from '@/utils/formatters'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'

export interface ProfissionalDashboard extends ProfissionalEquipe {
  agendamentosHoje: number
}

export function useDashboardNegocioData() {
  const { possuiModulo, possuiPermissao } = useNegocioContext()

  const loading = ref(false)
  const totalGanhoMes = ref(0)
  const totalGanhoMesAnterior = ref(0)
  const totalGanhoHoje = ref(0)
  const totalGanhoSemana = ref(0)
  const totalGanhoSemanaAnterior = ref(0)
  const agendamentosHoje = ref(0)
  const agendamentosOntem = ref(0)
  const agendamentosSemana = ref(0)
  const cancelamentosHoje = ref(0)
  const clientesAtivos = ref(0)
  const servicosAtivos = ref(0)
  const profissionais = ref<ProfissionalDashboard[]>([])
  const ultimosAtendimentos = ref<AgendaGeral[]>([])
  const proximosAtendimentos = ref<AgendaGeral[]>([])
  const avaliacaoResumo = ref<AvaliacaoResumoPublico | null>(null)
  const receitaUltimos7Dias = ref<ReceitaDia[]>([])
  const receitaUltimos30Dias = ref<ReceitaDia[]>([])
  const distribuicaoServicos = ref<DistribuicaoServico[]>([])
  const agendaTimeline = ref<AgendaTimelineItem[]>([])

  const variacaoReceitaMes = computed(() =>
    calcularVariacaoPercentual(totalGanhoMes.value, totalGanhoMesAnterior.value),
  )

  const variacaoAgendamentos = computed(() =>
    calcularVariacaoPercentual(agendamentosHoje.value, agendamentosOntem.value),
  )

  const taxaOcupacao = computed(() =>
    calcularTaxaOcupacao(agendamentosHoje.value, profissionais.value.length),
  )

  const clientesAtendidosHoje = computed(() => {
    const ids = new Set<number>()
    for (const ag of proximosAtendimentos.value) {
      if (ag.usuarioClienteId != null) ids.add(ag.usuarioClienteId)
    }
    return ids.size
  })

  const insights = computed<DashboardInsight[]>(() =>
    gerarInsights({
      agendamentosHoje: agendamentosHoje.value,
      variacaoReceitaMes: variacaoReceitaMes.value,
      variacaoAgendamentos: variacaoAgendamentos.value,
      avaliacaoResumo: avaliacaoResumo.value,
      proximosAtendimentos: proximosAtendimentos.value,
      totalGanhoSemana: totalGanhoSemana.value,
      totalGanhoSemanaAnterior: totalGanhoSemanaAnterior.value,
    }),
  )

  async function load(estabelecimentoId: number) {
    loading.value = true
    try {
      const hoje = getHojeRange()
      const ontem = getOntemRange()
      const mes = getMesAtualRange()
      const mesAnterior = getMesAnteriorRange()
      const semana = getSemanaAtualRange()
      const ultimos7 = getUltimos7DiasRange()
      const ultimos30 = getUltimos30DiasRange()
      const tasks: Promise<void>[] = []
      let agendamentosHojeLista: AgendaGeral[] = []

      if (possuiModulo('Agenda') && possuiPermissao('AgendaVisualizarGeral')) {
        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              inicio: hoje.inicio,
              fim: hoje.fim,
              pagina: 1,
              tamanhoPagina: 100,
              ordenacao: 'atendimento_asc',
            })
            .then((r) => {
              agendamentosHoje.value = r.total
              agendamentosHojeLista = r.itens
              proximosAtendimentos.value = r.itens
              cancelamentosHoje.value = r.itens.filter((a) => a.status === 'Cancelado').length
              agendaTimeline.value = montarTimelineAgenda(r.itens, formatTime)
              distribuicaoServicos.value = agregarDistribuicaoServicos(r.itens)
            })
            .catch(() => {
              agendamentosHoje.value = 0
              proximosAtendimentos.value = []
              cancelamentosHoje.value = 0
              agendaTimeline.value = []
            }),
        )

        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              inicio: ontem.inicio,
              fim: ontem.fim,
              pagina: 1,
              tamanhoPagina: 1,
            })
            .then((r) => { agendamentosOntem.value = r.total })
            .catch(() => { agendamentosOntem.value = 0 }),
        )

        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              inicio: semana.inicio,
              fim: semana.fim,
              pagina: 1,
              tamanhoPagina: 1,
            })
            .then((r) => { agendamentosSemana.value = r.total })
            .catch(() => { agendamentosSemana.value = 0 }),
        )

        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              inicio: mes.inicio,
              fim: mes.fim,
              pagina: 1,
              tamanhoPagina: 200,
            })
            .then((r) => {
              if (distribuicaoServicos.value.length === 0) {
                distribuicaoServicos.value = agregarDistribuicaoServicos(r.itens)
              }
            })
            .catch(() => {}),
        )

        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              pagina: 1,
              tamanhoPagina: 5,
              ordenacao: 'atendimento_desc',
            })
            .then((r) => { ultimosAtendimentos.value = r.itens })
            .catch(() => { ultimosAtendimentos.value = [] }),
        )
      }

      if (possuiModulo('Financeiro') && possuiPermissao('CaixaVisualizar')) {
        tasks.push(
          financeiroService
            .obterDashboard(estabelecimentoId, { inicio: mes.inicio, fim: mes.fim })
            .then((d) => { totalGanhoMes.value = d.totalEntradas })
            .catch(() => { totalGanhoMes.value = 0 }),
        )

        tasks.push(
          financeiroService
            .obterDashboard(estabelecimentoId, {
              inicio: mesAnterior.inicio,
              fim: mesAnterior.fim,
            })
            .then((d) => { totalGanhoMesAnterior.value = d.totalEntradas })
            .catch(() => { totalGanhoMesAnterior.value = 0 }),
        )

        tasks.push(
          financeiroService
            .obterDashboard(estabelecimentoId, { inicio: hoje.inicio, fim: hoje.fim })
            .then((d) => { totalGanhoHoje.value = d.totalEntradas })
            .catch(() => { totalGanhoHoje.value = 0 }),
        )

        tasks.push(
          financeiroService
            .obterDashboard(estabelecimentoId, { inicio: semana.inicio, fim: semana.fim })
            .then((d) => { totalGanhoSemana.value = d.totalEntradas })
            .catch(() => { totalGanhoSemana.value = 0 }),
        )

        const semanaAnteriorInicio = new Date(semana.inicio)
        semanaAnteriorInicio.setDate(semanaAnteriorInicio.getDate() - 7)
        const semanaAnteriorFim = new Date(semana.inicio)
        semanaAnteriorFim.setMilliseconds(semanaAnteriorFim.getMilliseconds() - 1)

        tasks.push(
          financeiroService
            .obterDashboard(estabelecimentoId, {
              inicio: semanaAnteriorInicio.toISOString(),
              fim: semanaAnteriorFim.toISOString(),
            })
            .then((d) => { totalGanhoSemanaAnterior.value = d.totalEntradas })
            .catch(() => { totalGanhoSemanaAnterior.value = 0 }),
        )

        tasks.push(
          financeiroService
            .listarEntradas(estabelecimentoId, {
              inicio: ultimos7.inicio,
              fim: ultimos7.fim,
              pagina: 1,
              tamanhoPagina: 500,
            })
            .then((r) => {
              receitaUltimos7Dias.value = agruparEntradasPorDia(r.itens, 7)
            })
            .catch(() => {
              receitaUltimos7Dias.value = agruparEntradasPorDia([], 7)
            }),
        )

        tasks.push(
          financeiroService
            .listarEntradas(estabelecimentoId, {
              inicio: ultimos30.inicio,
              fim: ultimos30.fim,
              pagina: 1,
              tamanhoPagina: 500,
            })
            .then((r) => {
              receitaUltimos30Dias.value = agruparEntradasPorDia(r.itens, 30)
            })
            .catch(() => {
              receitaUltimos30Dias.value = agruparEntradasPorDia([], 30)
            }),
        )
      }

      if (possuiModulo('Clientes') && possuiPermissao('ClienteVisualizarGeral')) {
        tasks.push(
          clienteNegocioService
            .listar(estabelecimentoId)
            .then((r) => { clientesAtivos.value = r.length })
            .catch(() => { clientesAtivos.value = 0 }),
        )
      }

      if (possuiModulo('Servicos') && possuiPermissao('ServicoVisualizar')) {
        tasks.push(
          servicoService
            .listar(estabelecimentoId, { ativo: true })
            .then((r) => { servicosAtivos.value = r.length })
            .catch(() => { servicosAtivos.value = 0 }),
        )
      }

      if (possuiPermissao('ProfissionalGerenciar')) {
        tasks.push(
          equipeService
            .listarProfissionais(estabelecimentoId)
            .then((r) => {
              profissionais.value = r.filter((p) => p.ativo).slice(0, 6).map((p) => ({
                ...p,
                agendamentosHoje: 0,
              }))
            })
            .catch(() => { profissionais.value = [] }),
        )
      }

      if (possuiPermissao('NegocioVisualizar')) {
        tasks.push(
          avaliacaoService
            .obterResumoNegocio(estabelecimentoId)
            .then((r) => { avaliacaoResumo.value = r })
            .catch(() => { avaliacaoResumo.value = null }),
        )
      }

      await Promise.all(tasks)

      if (possuiPermissao('ProfissionalGerenciar') && agendamentosHojeLista.length > 0) {
        const counts = new Map<number, number>()
        for (const ag of agendamentosHojeLista) {
          for (const item of ag.itens) {
            counts.set(item.profissionalId, (counts.get(item.profissionalId) ?? 0) + 1)
          }
        }
        profissionais.value = profissionais.value.map((p) => ({
          ...p,
          agendamentosHoje: counts.get(p.profissionalId) ?? 0,
        }))
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    totalGanhoMes,
    totalGanhoHoje,
    totalGanhoSemana,
    variacaoReceitaMes,
    variacaoAgendamentos,
    agendamentosHoje,
    agendamentosOntem,
    agendamentosSemana,
    cancelamentosHoje,
    clientesAtivos,
    clientesAtendidosHoje,
    servicosAtivos,
    profissionais,
    ultimosAtendimentos,
    proximosAtendimentos,
    avaliacaoResumo,
    receitaUltimos7Dias,
    receitaUltimos30Dias,
    distribuicaoServicos,
    agendaTimeline,
    taxaOcupacao,
    insights,
    load,
  }
}
