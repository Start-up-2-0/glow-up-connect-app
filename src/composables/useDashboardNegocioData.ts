import { computed, ref } from 'vue'
import { dashboardNegocioService } from '@/services/dashboardNegocioService'
import {
  calcularTaxaOcupacao,
  calcularVariacaoPercentual,
  gerarInsights,
  type AgendaTimelineItem,
  type DashboardInsight,
  type DistribuicaoServico,
  type ReceitaDia,
} from '@/utils/dashboardNegocioUtils'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'
import type { DashboardNegocioProfissional } from '@/types/dashboard.types'

export interface ProfissionalDashboard extends DashboardNegocioProfissional {}

export function useDashboardNegocioData() {
  const loading = ref(false)
  const error = ref<string | null>(null)
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
    error.value = null
    try {
      const data = await dashboardNegocioService.obter(estabelecimentoId)
      if (!data) throw new Error('Resposta vazia ao carregar o painel.')
      totalGanhoMes.value = data.totalGanhoMes
      totalGanhoMesAnterior.value = data.totalGanhoMesAnterior
      totalGanhoHoje.value = data.totalGanhoHoje
      totalGanhoSemana.value = data.totalGanhoSemana
      totalGanhoSemanaAnterior.value = data.totalGanhoSemanaAnterior
      agendamentosHoje.value = data.agendamentosHoje
      agendamentosOntem.value = data.agendamentosOntem
      agendamentosSemana.value = data.agendamentosSemana
      cancelamentosHoje.value = data.cancelamentosHoje
      clientesAtivos.value = data.clientesAtivos
      servicosAtivos.value = data.servicosAtivos
      profissionais.value = data.profissionais ?? []
      ultimosAtendimentos.value = data.ultimosAtendimentos ?? []
      proximosAtendimentos.value = data.proximosAtendimentos ?? []
      avaliacaoResumo.value = data.avaliacaoResumo
      receitaUltimos7Dias.value = data.receitaUltimos7Dias ?? []
      receitaUltimos30Dias.value = data.receitaUltimos30Dias ?? []
      distribuicaoServicos.value = (data.distribuicaoServicos ?? []).map((d) => ({
        nome: d.nome,
        count: d.quantidade,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Não foi possível carregar o painel.'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
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
