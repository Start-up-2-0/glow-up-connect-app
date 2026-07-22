import { computed, ref } from 'vue'
import type { LancamentoCaixaFiltro } from '@/types/negocio/caixa.types'

export type FinanceiroPeriodPreset = 'hoje' | '7d' | 'mes' | 'custom'

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function startOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}

function endOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T23:59:59`).toISOString()
}

export function useFinanceiroFiltros(defaultPreset: FinanceiroPeriodPreset = 'mes') {
  const periodPreset = ref<FinanceiroPeriodPreset>(defaultPreset)
  const inicioCustom = ref('')
  const fimCustom = ref('')
  const statusFilter = ref('')
  const tipoFilter = ref('')
  const busca = ref('')
  const pagina = ref(1)
  const tamanhoPagina = ref(20)

  const dateRange = computed(() => {
    const now = new Date()
    const hoje = toDateOnly(now)

    if (periodPreset.value === 'custom') {
      if (!inicioCustom.value) return null
      return {
        inicio: startOfDayIso(inicioCustom.value),
        fim: endOfDayIso(fimCustom.value || inicioCustom.value),
      }
    }

    if (periodPreset.value === 'hoje') {
      return { inicio: startOfDayIso(hoje), fim: endOfDayIso(hoje) }
    }

    if (periodPreset.value === '7d') {
      const start = new Date(now)
      start.setDate(start.getDate() - 6)
      return { inicio: startOfDayIso(toDateOnly(start)), fim: endOfDayIso(hoje) }
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { inicio: startOfDayIso(toDateOnly(start)), fim: endOfDayIso(hoje) }
  })

  const apiFiltro = computed((): LancamentoCaixaFiltro => {
    const range = dateRange.value
    const filtro: LancamentoCaixaFiltro = {
      pagina: pagina.value,
      tamanhoPagina: tamanhoPagina.value,
    }
    if (range?.inicio) filtro.inicio = range.inicio
    if (range?.fim) filtro.fim = range.fim
    if (statusFilter.value) filtro.status = statusFilter.value
    if (tipoFilter.value) filtro.tipo = tipoFilter.value
    if (busca.value.trim()) filtro.q = busca.value.trim()
    return filtro
  })

  function resetPagina() {
    pagina.value = 1
  }

  function aplicarPreset(preset: FinanceiroPeriodPreset) {
    periodPreset.value = preset
    resetPagina()
  }

  return {
    periodPreset,
    inicioCustom,
    fimCustom,
    statusFilter,
    tipoFilter,
    busca,
    pagina,
    tamanhoPagina,
    dateRange,
    apiFiltro,
    resetPagina,
    aplicarPreset,
  }
}
