import type { User } from '@/types/user.types'
import { calcularProgressoPerfil } from '@/utils/dashboardClienteUtils'

export type PerfilStatusTone = 'ok' | 'warning' | 'neutral'

export interface PerfilStatusItem {
  id: string
  label: string
  tone: PerfilStatusTone
}

export function buildPerfilStatusItems(
  profile: User,
  whatsAppState: 'sem-telefone' | 'confirmado' | 'pendente' | 'nao-confirmado',
): PerfilStatusItem[] {
  const progresso = calcularProgressoPerfil(profile)

  return [
    {
      id: 'conta',
      label: profile.ativo ? 'Conta ativa' : 'Conta inativa',
      tone: profile.ativo ? 'ok' : 'warning',
    },
    {
      id: 'email',
      label: 'E-mail confirmado',
      tone: profile.email ? 'ok' : 'warning',
    },
    {
      id: 'whatsapp',
      label:
        whatsAppState === 'confirmado'
          ? 'WhatsApp confirmado'
          : whatsAppState === 'pendente'
            ? 'WhatsApp pendente'
            : whatsAppState === 'sem-telefone'
              ? 'Telefone não cadastrado'
              : 'WhatsApp pendente',
      tone:
        whatsAppState === 'confirmado'
          ? 'ok'
          : whatsAppState === 'sem-telefone'
            ? 'neutral'
            : 'warning',
    },
    {
      id: 'dados',
      label: progresso >= 100 ? 'Dados completos' : `Perfil ${progresso}% completo`,
      tone: progresso >= 100 ? 'ok' : 'warning',
    },
  ]
}

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
