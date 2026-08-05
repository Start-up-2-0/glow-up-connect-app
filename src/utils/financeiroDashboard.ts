import type { FluxoCaixa } from '@/types/negocio/caixa.types'
import type { FinanceiroDashboard, FinanceiroPeriodoFiltro } from '@/types/negocio/financeiro.types'

export interface FinanceiroSeriePonto {
  label: string
  value: number
}

export interface FinanceiroSemanaFluxo {
  label: string
  entradas: number
  saidas: number
}

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

function formatDiaLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Série de saldo diário para o gráfico de linha do card Saldo atual. */
export function buildSaldoSerie(
  fluxo: FluxoCaixa | null | undefined,
  saldoAtual: number,
): FinanceiroSeriePonto[] {
  const dias = fluxo?.dias ?? []
  if (dias.length > 0) {
    return dias.map((dia, index) => ({
      label: index === dias.length - 1 ? 'Hoje' : formatDiaLabel(dia.data),
      value: dia.saldoFinalDia,
    }))
  }
  if (saldoAtual === 0) return []
  const base = saldoAtual * 0.82
  return [
    { label: 'Ini', value: Math.round(base * 0.7) },
    { label: '', value: Math.round(base * 0.85) },
    { label: '', value: Math.round(base * 0.78) },
    { label: '', value: Math.round(base * 0.95) },
    { label: 'Hoje', value: saldoAtual },
  ]
}

/** Agrupa o fluxo diário em semanas (ou sintetiza 5 semanas a partir dos totais). */
export function buildSemanasFluxo(
  fluxo: FluxoCaixa | null | undefined,
  totalEntradas: number,
  totalSaidas: number,
): FinanceiroSemanaFluxo[] {
  const dias = fluxo?.dias ?? []
  if (dias.length === 0) {
    if (totalEntradas === 0 && totalSaidas === 0) return []
    const pesos = [0.18, 0.22, 0.2, 0.24, 0.16]
    return pesos.map((peso, i) => ({
      label: `Sem ${String(i + 1).padStart(2, '0')}`,
      entradas: Math.round(totalEntradas * peso),
      saidas: Math.round(totalSaidas * peso),
    }))
  }

  const tamanho = Math.max(1, Math.ceil(dias.length / 5))
  const semanas: FinanceiroSemanaFluxo[] = []
  for (let i = 0; i < dias.length; i += tamanho) {
    const fatia = dias.slice(i, i + tamanho)
    semanas.push({
      label: `Sem ${String(semanas.length + 1).padStart(2, '0')}`,
      entradas: fatia.reduce((acc, d) => acc + d.entradas, 0),
      saidas: fatia.reduce((acc, d) => acc + d.saidas, 0),
    })
  }
  return semanas
}

export function mediaDiariaLucro(
  lucro: number,
  inicio: string | null | undefined,
  fim: string | null | undefined,
  fallbackDias = 31,
): number {
  if (!inicio || !fim) return lucro / fallbackDias
  const a = new Date(inicio).getTime()
  const b = new Date(fim).getTime()
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return lucro / fallbackDias
  const dias = Math.max(1, Math.round((b - a) / 86_400_000) + 1)
  return lucro / dias
}
