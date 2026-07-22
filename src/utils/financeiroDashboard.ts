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
