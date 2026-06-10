import { defineStore } from 'pinia'
import { ref } from 'vue'
import { agendamentoService } from '@/services/agendamentoService'
import type {
  AgendamentoCliente,
  AgendamentoFiltro,
  RemarcarAgendamentoPayload,
} from '@/types/agendamento.types'

export const useAgendamentosStore = defineStore('agendamentos', () => {
  const itens = ref<AgendamentoCliente[]>([])
  const total = ref(0)
  const pagina = ref(1)
  const loading = ref(false)
  const filtroAtual = ref<AgendamentoFiltro>({})
  const detalheCache = ref<Map<number, AgendamentoCliente>>(new Map())

  function invalidate() {
    itens.value = []
    total.value = 0
    pagina.value = 1
    detalheCache.value.clear()
  }

  async function fetchLista(filtro: AgendamentoFiltro = {}, append = false) {
    loading.value = true
    filtroAtual.value = filtro
    try {
      const data = await agendamentoService.listarMeus({
        pagina: filtro.pagina ?? 1,
        tamanhoPagina: filtro.tamanhoPagina ?? 20,
        ordenacao: filtro.ordenacao ?? 'proximos',
        status: filtro.status,
      })
      total.value = data.total
      pagina.value = data.pagina
      itens.value = append ? [...itens.value, ...data.itens] : data.itens
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchDetalhe(id: number, force = false) {
    if (!force && detalheCache.value.has(id)) {
      return detalheCache.value.get(id)!
    }
    const agendamento = await agendamentoService.obterMeu(id)
    detalheCache.value.set(id, agendamento)
    return agendamento
  }

  async function cancelar(id: number, motivo: string) {
    const agendamento = await agendamentoService.cancelar(id, { motivo })
    detalheCache.value.set(id, agendamento)
    invalidate()
    return agendamento
  }

  async function remarcar(id: number, payload: RemarcarAgendamentoPayload) {
    const agendamento = await agendamentoService.remarcar(id, payload)
    detalheCache.value.set(id, agendamento)
    invalidate()
    return agendamento
  }

  return {
    itens,
    total,
    pagina,
    loading,
    filtroAtual,
    invalidate,
    fetchLista,
    fetchDetalhe,
    cancelar,
    remarcar,
  }
})
