import { ref } from 'vue'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { avaliacaoService } from '@/services/avaliacaoService'
import { clienteNegocioService } from '@/services/clienteNegocioService'
import { equipeService } from '@/services/equipeService'
import { financeiroService } from '@/services/financeiroService'
import { servicoService } from '@/services/servicoService'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { getHojeRange, getMesAtualRange } from '@/utils/dashboardDateRange'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'

export function useDashboardNegocioData() {
  const { possuiModulo, possuiPermissao } = useNegocioContext()

  const loading = ref(false)
  const totalGanhoMes = ref(0)
  const agendamentosHoje = ref(0)
  const clientesAtivos = ref(0)
  const servicosAtivos = ref(0)
  const profissionais = ref<ProfissionalEquipe[]>([])
  const ultimosAtendimentos = ref<AgendaGeral[]>([])
  const avaliacaoResumo = ref<AvaliacaoResumoPublico | null>(null)

  async function load(estabelecimentoId: number) {
    loading.value = true
    try {
      const hoje = getHojeRange()
      const mes = getMesAtualRange()
      const tasks: Promise<void>[] = []

      if (possuiModulo('Agenda') && possuiPermissao('AgendaVisualizarGeral')) {
        tasks.push(
          agendaNegocioService
            .listarGeral(estabelecimentoId, {
              inicio: hoje.inicio,
              fim: hoje.fim,
              pagina: 1,
              tamanhoPagina: 1,
            })
            .then((r) => { agendamentosHoje.value = r.total })
            .catch(() => { agendamentosHoje.value = 0 }),
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
            .then((r) => { profissionais.value = r.filter((p) => p.ativo).slice(0, 6) })
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
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    totalGanhoMes,
    agendamentosHoje,
    clientesAtivos,
    servicosAtivos,
    profissionais,
    ultimosAtendimentos,
    avaliacaoResumo,
    load,
  }
}
