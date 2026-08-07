import { computed, ref } from 'vue'
import { agendamentoService } from '@/services/agendamentoService'
import { useUserStore } from '@/stores/user.store'
import { calcularVariacaoPercentual } from '@/utils/dashboardClienteUtils'
import type { ClienteRelacionamento, TimelineGroup } from '@/utils/dashboardClienteUtils'
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

function asAgendamentoCliente(raw: AgendamentoCliente | null): AgendamentoCliente | null {
  if (!raw) return null
  return {
    ...raw,
    estabelecimentoLogo: raw.estabelecimentoLogo ?? '',
    duracaoTotalMinutos: raw.duracaoTotalMinutos ?? 0,
    observacao: raw.observacao ?? '',
    origem: raw.origem ?? '',
    createAd: raw.createAd ?? raw.inicio,
    canceladoEm: raw.canceladoEm ?? null,
    endereco: raw.endereco ?? null,
    itens: raw.itens ?? [],
  }
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

      const data = await agendamentoService.obterDashboard()
      totalGastoMes.value = data.totalGastoMes
      totalGastoMesAnterior.value = data.totalGastoMesAnterior
      atendimentosMes.value = data.atendimentosMes
      totalAgendamentos.value = data.totalAgendamentos
      proximoAgendamento.value = asAgendamentoCliente(data.proximoAgendamento)
      historicoTimeline.value = data.historicoTimeline ?? []
      relacionamento.value = {
        ...RELACIONAMENTO_VAZIO,
        ...data.relacionamento,
        clienteDesde: data.relacionamento?.clienteDesde ?? userStore.profile?.createdAt ?? null,
      }
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
