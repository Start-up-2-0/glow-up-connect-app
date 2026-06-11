import type { NavIconName } from '@/types/navIcon.types'

const NAV_ICON_BY_ID: Record<string, NavIconName> = {
  dashboard: 'dashboard',
  inicio: 'home',
  explorar: 'explore',
  'meus-agendamentos': 'calendar',
  convites: 'invites',
  perfil: 'user',
  'abrir-loja': 'store-open',
  agenda: 'calendar',
  servicos: 'services',
  'meus-servicos': 'services',
  horarios: 'clock',
  'meus-horarios': 'clock',
  'profissionais-vitrine': 'team',
  equipe: 'team',
  whatsapp: 'whatsapp',
  financeiro: 'finance',
  'perfil-estabelecimento': 'building',
  assinatura: 'subscription',
}

export function resolveNavIcon(id: string, explicit?: NavIconName): NavIconName {
  return explicit ?? NAV_ICON_BY_ID[id] ?? 'dashboard'
}
