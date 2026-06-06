import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole, type UserRole } from '@/types/user.types'

export interface NavChildItem {
  id: string
  label: string
  to?: string
}

export interface NavItem {
  id: string
  label: string
  to?: string
  children?: NavChildItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 272
export const SIDEBAR_WIDTH_COLLAPSED = 99

/** Menu operacional — roles de negócio (não Cliente). */
export const businessNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: ROUTE_PATHS.DASHBOARD,
  },
  {
    id: 'clientes',
    label: 'Clientes',
  },
  {
    id: 'estabelecimentos',
    label: 'Estabelecimentos',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    children: [
      { id: 'agenda-hoje', label: 'Hoje' },
      { id: 'agenda-semana', label: 'Semana' },
      { id: 'agenda-mes', label: 'Mês' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    children: [
      { id: 'config-perfil', label: 'Perfil' },
      { id: 'config-equipe', label: 'Equipe' },
    ],
  },
]

/** Menu do cliente final — ver docs/acesso/cliente.md */
export const clienteNavItems: NavItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    to: ROUTE_PATHS.DASHBOARD,
  },
  {
    id: 'explorar',
    label: 'Explorar lojas',
    to: ROUTE_PATHS.EXPLORAR,
  },
  {
    id: 'meus-agendamentos',
    label: 'Meus agendamentos',
    to: ROUTE_PATHS.MEUS_AGENDAMENTOS,
  },
  {
    id: 'convites',
    label: 'Convites',
    to: ROUTE_PATHS.CONVITES,
  },
  {
    id: 'perfil',
    label: 'Meu perfil',
    to: ROUTE_PATHS.PERFIL,
  },
]

export const NAV_SEARCH_PLACEHOLDER_BUSINESS =
  'Dashboard, clientes, estabelecimentos...'

export const NAV_SEARCH_PLACEHOLDER_CLIENTE =
  'Explorar lojas, agendamentos, perfil...'

/** @deprecated Use getNavSearchPlaceholder(role) */
export const NAV_SEARCH_PLACEHOLDER = NAV_SEARCH_PLACEHOLDER_BUSINESS

export function getNavItemsForRole(role: UserRole | string | number | undefined): NavItem[] {
  return isClienteRole(role) ? clienteNavItems : businessNavItems
}

export function getNavSearchPlaceholder(role: UserRole | string | number | undefined): string {
  return isClienteRole(role) ? NAV_SEARCH_PLACEHOLDER_CLIENTE : NAV_SEARCH_PLACEHOLDER_BUSINESS
}
