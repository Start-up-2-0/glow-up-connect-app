import { computed, ref } from 'vue'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { avaliacaoService } from '@/services/avaliacaoService'
import { equipeService } from '@/services/equipeService'
import { getHojeRange, getMesAtualRange } from '@/utils/dashboardDateRange'
import type { AgendaProfissional } from '@/types/negocio/agenda.types'
import type { AvaliacaoNegocioItem } from '@/types/avaliacao.types'

export function useDashboardProfissionalData() {
  const loading = ref(false)
  const totalAtendimentos = ref(0)
  const atendimentosHoje = ref(0)
  const ultimosAtendimentos = ref<AgendaProfissional[]>([])
  const proximosAtendimentos = ref<AgendaProfissional[]>([])
  const ultimasAvaliacoes = ref<AvaliacaoNegocioItem[]>([])
  const notaMedia = ref<number | null>(null)
  const totalAvaliacoes = ref(0)

  const proximoAtendimento = computed(() => {
    const agora = Date.now()
    return (
      proximosAtendimentos.value.find(
        (a) =>
          a.status !== 'Cancelado' &&
          a.agendamentoStatus !== 'Cancelado' &&
          new Date(a.fim).getTime() >= agora,
      ) ?? null
    )
  })

  async function load(
    estabelecimentoId: number,
    profissionalId?: number | null,
    profissionalNome?: string,
  ) {
    loading.value = true
    try {
      const mes = getMesAtualRange()
      const hoje = getHojeRange()

      const [agendaMes, agendaHoje, agendaRecentes, profissionais, avaliacoes] =
        await Promise.all([
          agendaNegocioService
            .listarPropria(estabelecimentoId, {
              inicio: mes.inicio,
              fim: mes.fim,
              pagina: 1,
              tamanhoPagina: 1,
            })
            .catch(() => ({ total: 0, itens: [] as AgendaProfissional[] })),
          agendaNegocioService
            .listarPropria(estabelecimentoId, {
              inicio: hoje.inicio,
              fim: hoje.fim,
              pagina: 1,
              tamanhoPagina: 20,
              ordenacao: 'atendimento_asc',
            })
            .catch(() => ({ total: 0, itens: [] as AgendaProfissional[] })),
          agendaNegocioService
            .listarPropria(estabelecimentoId, {
              pagina: 1,
              tamanhoPagina: 6,
              ordenacao: 'atendimento_desc',
            })
            .catch(() => ({ total: 0, itens: [] as AgendaProfissional[] })),
          equipeService.listarProfissionais(estabelecimentoId).catch(() => []),
          avaliacaoService.listarNegocio(estabelecimentoId, 1, 20).catch(() => null),
        ])

      totalAtendimentos.value = agendaMes.total
      atendimentosHoje.value = agendaHoje.total
      proximosAtendimentos.value = agendaHoje.itens
      ultimosAtendimentos.value = agendaRecentes.itens

      const profAtual = profissionais.find((p) => p.profissionalId === profissionalId)
      if (profAtual) {
        notaMedia.value = profAtual.notaMedia ?? null
        totalAvaliacoes.value = profAtual.totalAvaliacoes ?? 0
      }

      if (avaliacoes && profissionalNome) {
        ultimasAvaliacoes.value = avaliacoes.itens
          .filter((a) => a.profissionalNome === profissionalNome)
          .slice(0, 5)
      } else {
        ultimasAvaliacoes.value = []
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    totalAtendimentos,
    atendimentosHoje,
    ultimosAtendimentos,
    proximosAtendimentos,
    proximoAtendimento,
    ultimasAvaliacoes,
    notaMedia,
    totalAvaliacoes,
    load,
  }
}
