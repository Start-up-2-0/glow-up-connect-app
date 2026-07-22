import { ref } from 'vue'
import { agendamentoService } from '@/services/agendamentoService'
import { useUserStore } from '@/stores/user.store'
import { getMesAtualRange } from '@/utils/dashboardDateRange'
import type { AgendamentoCliente } from '@/types/agendamento.types'

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

const STATUS_CONCLUIDO = new Set(['Concluido', 'Concluído'])

export function useDashboardClienteData() {
  const loading = ref(false)
  const totalGastoMes = ref(0)
  const agendamentosRecentes = ref<AgendamentoCliente[]>([])
  const lojasFavoritas = ref<DashboardFavoritoLoja[]>([])
  const profissionaisFavoritos = ref<DashboardFavoritoProfissional[]>([])

  async function load() {
    loading.value = true
    try {
      const userStore = useUserStore()
      if (!userStore.profile) {
        await userStore.fetchMe()
      }

      const mes = getMesAtualRange()
      const [mesResult, recentesResult] = await Promise.all([
        agendamentoService.listarMeus({
          dataInicio: mes.inicio,
          dataFim: mes.fim,
          pagina: 1,
          tamanhoPagina: 50,
          ordenacao: 'recentes',
        }),
        agendamentoService.listarMeus({
          pagina: 1,
          tamanhoPagina: 6,
          ordenacao: 'recentes',
        }),
      ])

      totalGastoMes.value = mesResult.itens
        .filter((a) => STATUS_CONCLUIDO.has(a.status))
        .reduce((sum, a) => sum + a.valorTotal, 0)

      agendamentosRecentes.value = recentesResult.itens

      const lojasMap = new Map<string, DashboardFavoritoLoja>()
      const profMap = new Map<string, DashboardFavoritoProfissional>()

      for (const ag of recentesResult.itens) {
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
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    totalGastoMes,
    agendamentosRecentes,
    lojasFavoritas,
    profissionaisFavoritos,
    load,
  }
}
