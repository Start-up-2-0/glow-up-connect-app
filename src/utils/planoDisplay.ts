import type { Plano } from '@/types/plano.types'

export const LANDING_PLANO_MAX_FEATURES = 5

export const PLANO_LIMITE_ITEMS = [
  { key: 'limiteUsuarios', label: 'Usuários' },
  { key: 'limiteProfissionais', label: 'Profissionais' },
  { key: 'limiteServicos', label: 'Serviços' },
  { key: 'limiteAgendamentos', label: 'Agendamentos' },
] as const satisfies ReadonlyArray<{
  key: 'limiteUsuarios' | 'limiteProfissionais' | 'limiteServicos' | 'limiteAgendamentos'
  label: string
}>

export function getPlanoFeatures(plano: Plano): string[] {
  return plano.funcionalidades.length > 0 ? plano.funcionalidades : plano.modulos
}
