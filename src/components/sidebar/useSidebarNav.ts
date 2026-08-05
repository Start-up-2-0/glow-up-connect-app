import { useRoute } from 'vue-router'
import { useDashboardNav } from '@/composables/useDashboardNav'
import type { NavItem } from '@/constants/navigation'

/** Títulos premium para os grupos de navegação. */
const GROUP_LABELS: Record<string, string> = {
  'sec-principal': 'Principal',
  'sec-financeiro': 'Financeiro',
  'sec-configuracoes': 'Configurações',
  'sec-agenda': 'Agendamentos',
  'sec-conta': 'Conta',
}

export interface SidebarBadge {
  value: string
  tone?: 'default' | 'accent' | 'success'
}

export function useSidebarNav() {
  const route = useRoute()
  const { navSections } = useDashboardNav()

  /** Item ativo derivado da rota (prefixo; exato para /dashboard). */
  function isRouteActive(to?: string): boolean {
    if (!to) return false
    if (to === '/dashboard') return route.path === to
    return route.path === to || route.path.startsWith(to + '/')
  }

  function hasActiveChild(item: NavItem): boolean {
    if (isRouteActive(item.to)) return true
    return !!item.children?.some((c) => isRouteActive(c.to))
  }

  function sectionLabel(id: string, original: string): string {
    return GROUP_LABELS[id] ?? original
  }

  /** Badge por item (config-driven — veja `badge` no navigation.ts). */
  function badgeFor(id: string): SidebarBadge | null {
    if (id === 'clientes') return { value: 'Novo', tone: 'success' }
    return null
  }

  return {
    navSections,
    isRouteActive,
    hasActiveChild,
    sectionLabel,
    badgeFor,
  }
}
