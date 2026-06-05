import { ROUTE_PATHS } from '@/constants/routes'

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

export const dashboardNavItems: NavItem[] = [
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

export const NAV_SEARCH_PLACEHOLDER = 'Dashboard, cliente, estabelecimentos...'
