import { computed, ref } from 'vue'
import { agendamentoService } from '@/services/agendamentoService'
import { publicoService } from '@/services/publicoService'
import { useUserStore } from '@/stores/user.store'
import { getMesAnteriorRange, getMesAtualRange } from '@/utils/dashboardDateRange'
import {
  agruparHistoricoTimeline,
  calcularProgressoPerfil,
  calcularVariacaoPercentual,
  encontrarProximoAgendamento,
  gerarNovidades,
  isAgendamentoConcluido,
  type ClienteNovidade,
  type TimelineGroup,
} from '@/utils/dashboardClienteUtils'
import type { AgendamentoCliente } from '@/types/agendamento.types'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'

export interface DashboardFavoritoLoja {
  id: string
  nome: string
  logo: string
  publicGuid: string
  visitas: number
}

export interface DashboardFavoritoProfissional {
  id: string
  nome: string
  estabelecimentoNome: string
  visitas: number
}

export function useDashboardClienteData() {
  const loading = ref(false)
  const totalGastoMes = ref(0)
  const totalGastoMesAnterior = ref(0)
  const atendimentosMes = ref(0)
  const totalAgendamentos = ref(0)
  const proximoAgendamento = ref<AgendamentoCliente | null>(null)
  const agendamentosRecentes = ref<AgendamentoCliente[]>([])
  const historicoTimeline = ref<TimelineGroup[]>([])
  const lojasFavoritas = ref<DashboardFavoritoLoja[]>([])
  const profissionaisFavoritos = ref<DashboardFavoritoProfissional[]>([])
  const recomendados = ref<EstabelecimentoProximo[]>([])
  const novidades = ref<ClienteNovidade[]>([])
  const progressoPerfil = ref(0)

  const variacaoGastoMes = computed(() =>
    calcularVariacaoPercentual(totalGastoMes.value, totalGastoMesAnterior.value),
  )

  const temAgendamentos = computed(() => totalAgendamentos.value > 0)

  async function carregarRecomendados() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          maximumAge: 300000,
        })
      })
      const data = await publicoService.listarProximos({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        raioKm: 10,
        pagina: 1,
        tamanhoPagina: 3,
      })
      recomendados.value = data.itens
    } catch {
      recomendados.value = []
    }
  }

  function derivarFavoritos(itens: AgendamentoCliente[]) {
    const lojasMap = new Map<string, DashboardFavoritoLoja>()
    const profMap = new Map<string, DashboardFavoritoProfissional>()

    for (const ag of itens) {
      if (!lojasMap.has(ag.estabelecimentoPublicGuid)) {
        lojasMap.set(ag.estabelecimentoPublicGuid, {
          id: ag.estabelecimentoPublicGuid,
          nome: ag.estabelecimentoNome,
          logo: ag.estabelecimentoLogo,
          publicGuid: ag.estabelecimentoPublicGuid,
          visitas: 1,
        })
      } else {
        lojasMap.get(ag.estabelecimentoPublicGuid)!.visitas += 1
      }

      for (const item of ag.itens) {
        const key = `${item.profissionalId}-${ag.estabelecimentoPublicGuid}`
        if (!profMap.has(key)) {
          profMap.set(key, {
            id: key,
            nome: item.profissionalNome,
            estabelecimentoNome: ag.estabelecimentoNome,
            visitas: 1,
          })
        } else {
          profMap.get(key)!.visitas += 1
        }
      }
    }

    lojasFavoritas.value = [...lojasMap.values()]
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 4)

    profissionaisFavoritos.value = [...profMap.values()]
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 4)
  }

  async function load() {
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.profile) {
        await userStore.fetchMe()
      }

      progressoPerfil.value = calcularProgressoPerfil(userStore.profile)

      const mes = getMesAtualRange()
      const mesAnterior = getMesAnteriorRange()

      const [mesResult, mesAnteriorResult, recentesResult, proximosResult, totalResult] =
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
            tamanhoPagina: 8,
            ordenacao: 'recentes',
          }),
          agendamentoService.listarMeus({
            pagina: 1,
            tamanhoPagina: 10,
            ordenacao: 'proximos',
          }),
          agendamentoService.listarMeus({
            pagina: 1,
            tamanhoPagina: 1,
            ordenacao: 'recentes',
          }),
        ])

      const concluidosMes = mesResult.itens.filter((a) => isAgendamentoConcluido(a.status))
      totalGastoMes.value = concluidosMes.reduce((sum, a) => sum + a.valorTotal, 0)
      atendimentosMes.value = concluidosMes.length

      totalGastoMesAnterior.value = mesAnteriorResult.itens
        .filter((a) => isAgendamentoConcluido(a.status))
        .reduce((sum, a) => sum + a.valorTotal, 0)

      totalAgendamentos.value = totalResult.total
      proximoAgendamento.value = encontrarProximoAgendamento(proximosResult.itens)
      agendamentosRecentes.value = recentesResult.itens
      historicoTimeline.value = agruparHistoricoTimeline(recentesResult.itens)
      derivarFavoritos(recentesResult.itens)

      await carregarRecomendados()
      novidades.value = gerarNovidades(recomendados.value, totalAgendamentos.value > 0)
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
    agendamentosRecentes,
    historicoTimeline,
    lojasFavoritas,
    profissionaisFavoritos,
    recomendados,
    novidades,
    progressoPerfil,
    temAgendamentos,
    load,
  }
}
