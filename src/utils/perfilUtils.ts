import { calcularProgressoPerfil } from '@/utils/dashboardClienteUtils'

export function formatUltimaAtualizacao(updatedAt?: string | null): string {
  if (!updatedAt) return 'Hoje'
  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return 'Hoje'

  const hoje = new Date()
  if (date.toDateString() === hoje.toDateString()) return 'Hoje'

  const diffDays = Math.floor((hoje.getTime() - date.getTime()) / 86400000)
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).replace('.', '')
}

export { calcularProgressoPerfil }
