import type { FinanceiroDashboard, FinanceiroPeriodoFiltro } from '@/types/negocio/financeiro.types'

export function createEmptyFinanceiroDashboard(
  filtro?: FinanceiroPeriodoFiltro,
): FinanceiroDashboard {
  return {
    saldoAtual: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    lucroLiquido: 0,
    contasEmAberto: 0,
    quantidadeContasEmAberto: 0,
    comissoesPeriodo: 0,
    periodoInicio: filtro?.inicio ?? null,
    periodoFim: filtro?.fim ?? null,
  }
}

export function isFinanceiroDashboardSemMovimentacao(dashboard: FinanceiroDashboard): boolean {
  return dashboard.totalEntradas === 0 && dashboard.totalSaidas === 0
}

export function isFinanceiroDashboardEmptyResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const axiosError = error as { response?: { status?: number; data?: { code?: string } } }
  const status = axiosError.response?.status
  const code = axiosError.response?.data?.code

  return status === 404 && code === 'CAIXA_NEGOCIO_NAO_ENCONTRADO'
}

export function getPreviousPeriodFilter(
  filtro: FinanceiroPeriodoFiltro,
): FinanceiroPeriodoFiltro | null {
  if (!filtro.inicio || !filtro.fim) return null

  const inicio = new Date(filtro.inicio)
  const fim = new Date(filtro.fim)
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return null

  const duration = fim.getTime() - inicio.getTime()
  const prevFim = new Date(inicio.getTime() - 1)
  const prevInicio = new Date(prevFim.getTime() - duration)

  return {
    inicio: prevInicio.toISOString(),
    fim: prevFim.toISOString(),
  }
}

export function calcularVariacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) {
    if (atual === 0) return null
    return 100
  }
  return ((atual - anterior) / Math.abs(anterior)) * 100
}
