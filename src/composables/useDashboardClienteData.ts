import { computed, ref } from 'vue'
import { agendamentoService } from '@/services/agendamentoService'
import { useUserStore } from '@/stores/user.store'
import { getMesAnteriorRange, getMesAtualRange } from '@/utils/dashboardDateRange'
import {
  agruparHistoricoTimeline,
  calcularVariacaoPercentual,
  derivarRelacionamento,
  encontrarProximoAgendamento,
  isAgendamentoConcluido,
  type ClienteRelacionamento,
  type TimelineGroup,
} from '@/utils/dashboardClienteUtils'
import type { AgendamentoCliente } from '@/types/agendamento.types'

const RELACIONAMENTO_VAZIO: ClienteRelacionamento = {
  lojaMaisFrequente: null,
  profissionalMaisFrequente: null,
  servicoMaisContratado: null,
  ultimaVisita: null,
  clienteDesde: null,
  totalAtendimentos: 0,
  totalGastoAcumulado: 0,
  frequenciaMediaDias: null,
}

export function useDashboardClienteData() {
  const loading = ref(false)
  const totalGastoMes = ref(0)
  const totalGastoMesAnterior = ref(0)
  const atendimentosMes = ref(0)
  const totalAgendamentos = ref(0)
  const proximoAgendamento = ref<AgendamentoCliente | null>(null)
  const historicoTimeline = ref<TimelineGroup[]>([])
  const relacionamento = ref<ClienteRelacionamento>({ ...RELACIONAMENTO_VAZIO })

  const variacaoGastoMes = computed(() =>
    calcularVariacaoPercentual(totalGastoMes.value, totalGastoMesAnterior.value),
  )

  const temAgendamentos = computed(() => totalAgendamentos.value > 0)

  async function load() {
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.profile) {
        await userStore.fetchMe()
      }

      const mes = getMesAtualRange()
      const mesAnterior = getMesAnteriorRange()

      const [mesResult, mesAnteriorResult, historicoResult, proximosResult] =
        await Promise.all([
          agendamentoService.listarMeus({
            dataInicio: mes.inicio,
            dataFim: mes.fim,
            pagina: 1,
            tamanhoPagina: 50,
            ordenacao: 'recentes',
          }),
          agendamentoService.listarMeus({
            dataInicio: mesAnterior.inicio,
            dataFim: mesAnterior.fim,
            pagina: 1,
            tamanhoPagina: 50,
            ordenacao: 'recentes',
          }),
          agendamentoService.listarMeus({
            pagina: 1,
            tamanhoPagina: 80,
            ordenacao: 'recentes',
          }),
          agendamentoService.listarMeus({
            pagina: 1,
            tamanhoPagina: 10,
            ordenacao: 'proximos',
          }),
        ])

      const concluidosMes = mesResult.itens.filter((a) => isAgendamentoConcluido(a.status))
      totalGastoMes.value = concluidosMes.reduce((sum, a) => sum + a.valorTotal, 0)
      atendimentosMes.value = concluidosMes.length

      totalGastoMesAnterior.value = mesAnteriorResult.itens
        .filter((a) => isAgendamentoConcluido(a.status))
        .reduce((sum, a) => sum + a.valorTotal, 0)

      totalAgendamentos.value = historicoResult.total
      proximoAgendamento.value = encontrarProximoAgendamento(proximosResult.itens)
      historicoTimeline.value = agruparHistoricoTimeline(historicoResult.itens, 6)
      relacionamento.value = derivarRelacionamento(
        historicoResult.itens,
        historicoResult.total,
        userStore.profile?.createdAt,
      )
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    totalGastoMes,
    variacaoGastoMes,
    atendimentosMes,
    totalAgendamentos,
    proximoAgendamento,
    historicoTimeline,
    relacionamento,
    temAgendamentos,
    load,
  }
}
