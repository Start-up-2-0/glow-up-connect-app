import type { MovimentoDirecao, MovimentoFinanceiro, MovimentoStatus } from '@/types/negocio/financeiro.types'
import { formatCurrency } from '@/utils/formatters'

export type MovimentoSortOption = 'recente' | 'antigo' | 'maior_valor' | 'menor_valor'

export const FORMAS_PAGAMENTO_FILTRO = [
  'Todos',
  'Pix',
  'Dinheiro',
  'Cartão',
  'Transferência',
  'Mercado Pago',
  'Outro',
] as const

export const CATEGORIAS_ENTRADA_FILTRO = [
  'Todas',
  'Serviços',
  'Produtos',
  'Comissão',
  'Outros',
] as const

export function formatSignedCurrency(valor: number, direcao: MovimentoDirecao): string {
  const formatted = formatCurrency(Math.abs(valor))
  return direcao === 'entrada' ? `+ ${formatted}` : `− ${formatted}`
}

export function resolveFormaPagamento(item: MovimentoFinanceiro): string {
  if (item.formaPagamento?.trim()) return item.formaPagamento.trim()
  const match = item.descricao.match(/\(([^)]+)\)\s*$/)
  return match?.[1]?.trim() ?? '—'
}

export function resolveTituloMovimento(item: MovimentoFinanceiro): string {
  return item.descricao.replace(/\s*\([^)]+\)\s*$/, '').trim() || item.descricao
}

export function resolveCategoriaEntrada(item: MovimentoFinanceiro): string {
  if (item.categoria?.trim()) return item.categoria.trim()
  if (item.origem === 'atendimento') return 'Serviços'
  if (item.origem === 'comissao') return 'Comissão'
  if (item.origem === 'pagamento_online') return 'Produtos'
  return 'Outros'
}

export function resolveCategoriaSaida(item: MovimentoFinanceiro): string {
  return item.categoria?.trim() || 'Outros'
}

export function matchesFormaPagamento(item: MovimentoFinanceiro, filtro: string): boolean {
  if (!filtro || filtro === 'Todos') return true
  const forma = resolveFormaPagamento(item).toLowerCase()
  if (filtro === 'Mercado Pago') return forma.includes('mercado')
  if (filtro === 'Cartão') return forma.includes('cart')
  return forma.includes(filtro.toLowerCase())
}

export function matchesCategoriaEntrada(item: MovimentoFinanceiro, filtro: string): boolean {
  if (!filtro || filtro === 'Todas') return true
  return resolveCategoriaEntrada(item).toLowerCase() === filtro.toLowerCase()
}

export function sortMovimentos(
  itens: MovimentoFinanceiro[],
  sort: MovimentoSortOption,
): MovimentoFinanceiro[] {
  const copy = [...itens]
  switch (sort) {
    case 'antigo':
      return copy.sort((a, b) => a.data.localeCompare(b.data))
    case 'maior_valor':
      return copy.sort((a, b) => b.valor - a.valor)
    case 'menor_valor':
      return copy.sort((a, b) => a.valor - b.valor)
    default:
      return copy.sort((a, b) => b.data.localeCompare(a.data))
  }
}

export function calcularTicketMedio(totalValor: number, quantidade: number): number {
  if (quantidade <= 0) return 0
  return totalValor / quantidade
}

export function agruparPorFormaPagamento(itens: MovimentoFinanceiro[]): Array<{ label: string; total: number; pct: number }> {
  const map = new Map<string, number>()
  let grand = 0
  for (const item of itens) {
    const label = resolveFormaPagamento(item)
    map.set(label, (map.get(label) ?? 0) + item.valor)
    grand += item.valor
  }
  if (grand <= 0) return []
  return Array.from(map.entries())
    .map(([label, total]) => ({
      label,
      total,
      pct: Math.round((total / grand) * 100),
    }))
    .sort((a, b) => b.total - a.total)
}

export function statusLabel(status: MovimentoStatus, isEntrada: boolean): string {
  const map: Record<MovimentoStatus, string> = {
    recebido: 'Recebido',
    pago: 'Pago',
    pendente: isEntrada ? 'Pendente' : 'A pagar',
    vencido: 'Vencido',
    estornado: 'Estornado',
    cancelado: 'Cancelado',
  }
  return map[status] ?? status
}

export function isStatusPositivo(status: MovimentoStatus): boolean {
  return status === 'recebido' || status === 'pago'
}
