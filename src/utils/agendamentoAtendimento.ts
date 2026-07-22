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

/** Fallback de permissão para equipe da loja com agenda geral (sessão pode não listar AtendimentoIniciar ainda). */
export function possuiPermissaoIniciarAtendimento(possuiPermissao: (permissao: string) => boolean): boolean {
  return possuiPermissao('AtendimentoIniciar') || possuiPermissao('AgendaVisualizarGeral')
}

export function possuiPermissaoFinalizarAtendimento(
  possuiPermissao: (permissao: string) => boolean,
): boolean {
  return possuiPermissao('AtendimentoFinalizar') || possuiPermissao('AgendaVisualizarGeral')
}

/**
 * Libera início a partir do horário agendado, sem limite máximo (atrasos operacionais).
 * Compara instantes UTC quando o backend envia ISO com offset/Z.
 */
export function horarioPermiteIniciarAtendimento(inicio: string, agora: Date = new Date()): boolean {
  const inicioMs = new Date(inicio).getTime()
  if (Number.isNaN(inicioMs)) return false
  return agora.getTime() >= inicioMs
}

export function statusPermiteIniciarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
): boolean {
  if (itemStatus !== 'Confirmado') return false
  if (STATUS_BLOQUEADOS_INICIO.includes(agendamentoStatus)) return false
  return STATUS_AGENDAMENTO_INICIAVEL.includes(agendamentoStatus)
}

export function podeIniciarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
  inicio: string,
  _fim?: string | null,
): boolean {
  if (!statusPermiteIniciarItemAtendimento(itemStatus, agendamentoStatus)) return false
  return horarioPermiteIniciarAtendimento(inicio)
}

export function motivoInicioIndisponivel(inicio: string): string | null {
  const inicioMs = new Date(inicio).getTime()
  if (Number.isNaN(inicioMs)) return 'Horário do atendimento inválido.'
  if (Date.now() < inicioMs) return 'O horário do atendimento ainda não chegou.'
  return null
}

export function statusPermiteFinalizarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
): boolean {
  return itemStatus === 'EmAtendimento' && agendamentoStatus === 'EmAtendimento'
}

export function podeFinalizarItemAtendimento(
  itemStatus: string,
  agendamentoStatus: string,
): boolean {
  return statusPermiteFinalizarItemAtendimento(itemStatus, agendamentoStatus)
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
