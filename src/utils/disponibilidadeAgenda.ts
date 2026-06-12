import { toDateOnlyFromIsoUtc } from '@/utils/formatters'
import type { SlotDisponivel } from '@/types/agendamento.types'

export const DISPONIBILIDADE_JANELA_DIAS = 31

export function normalizarDatasAtendimento(datas: string[], minDate: string): string[] {
  return [...new Set(datas.filter((data) => data >= minDate))].sort()
}

export function mesclarDatasAtendimento(
  atuais: string[],
  novas: string[],
  minDate: string,
): string[] {
  return normalizarDatasAtendimento([...atuais, ...novas], minDate)
}

export function primeiraDataAtendimentoDisponivel(
  datas: string[],
  minDate: string,
): string | null {
  return datas.find((data) => data >= minDate) ?? null
}

export function filtrarSlotsDoDia(slots: SlotDisponivel[], dataConsulta: string): SlotDisponivel[] {
  return slots.filter((slot) => toDateOnlyFromIsoUtc(slot.inicio) === dataConsulta)
}

export function isDataAtendimentoPermitida(datas: string[], isoDate: string): boolean {
  return datas.includes(isoDate)
}
