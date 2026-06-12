import type { AgendamentoStatus } from '@/types/agendamento.types'

const STATUS_BLOQUEADOS_INICIO: readonly string[] = [
  'Cancelado',
  'Concluido',
  'Expirado',
  'Reembolsado',
  'NaoCompareceu',
  'PendenteConfirmacao',
  'Remarcado',
  'PendentePagamento',
]

const STATUS_AGENDAMENTO_INICIAVEL: readonly string[] = ['Confirmado', 'EmAtendimento']

export function horarioPermiteIniciarAtendimento(
  inicio: string,
  fim: string,
  agora: Date = new Date(),
): boolean {
  const inicioMs = new Date(inicio).getTime()
  const fimMs = new Date(fim).getTime()
  const agoraMs = agora.getTime()
  if (Number.isNaN(inicioMs) || Number.isNaN(fimMs)) return false
  return agoraMs >= inicioMs && agoraMs <= fimMs
}

export function podeIniciarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
  inicio: string,
  fim: string,
): boolean {
  if (itemStatus !== 'Confirmado') return false
  if (STATUS_BLOQUEADOS_INICIO.includes(agendamentoStatus)) return false
  if (!STATUS_AGENDAMENTO_INICIAVEL.includes(agendamentoStatus)) return false
  return horarioPermiteIniciarAtendimento(inicio, fim)
}

export function podeFinalizarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
): boolean {
  return itemStatus === 'EmAtendimento' && agendamentoStatus === 'EmAtendimento'
}

export function labelStatusItemAtendimento(status: string): string {
  const labels: Record<string, string> = {
    Pendente: 'Pendente',
    Confirmado: 'Confirmado',
    EmAtendimento: 'Em atendimento',
    Concluido: 'Concluído',
    Cancelado: 'Cancelado',
    Repassado: 'Repassado',
  }
  return labels[status] ?? status
}

export type { AgendamentoStatus }
