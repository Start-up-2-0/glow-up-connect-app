import { useRoute } from 'vue-router'
import { useDashboardNav } from '@/composables/useDashboardNav'
import type { NavItem } from '@/constants/navigation'

/** Títulos premium para os grupos de navegação. */
const GROUP_LABELS: Record<string, string> = {
  'sec-gestao': 'Gestão',
  'sec-principal': 'Gestão',
  'sec-financeiro': 'Financeiro',
  'sec-configuracoes': 'Configurações',
  'sec-explorar': 'Agendar e explorar',
  'sec-agenda': 'Agendar e explorar',
  'sec-conta': 'Conta',
  'sec-trabalho': 'Trabalho',
}

export interface SidebarBadge {
  value: string
  tone?: 'default' | 'accent' | 'success' | 'premium'
}

export function useSidebarNav() {
  const route = useRoute()
  const { navSections } = useDashboardNav()

  function isRouteActive(to?: string): boolean {
    if (!to) return false
    // Folhas cujo path é prefixo de outras rotas do menu
    if (
      to === '/dashboard' ||
      to === '/financeiro' ||
      to === '/configuracoes/assinatura'
    ) {
      return route.path === to
    }
    return route.path === to || route.path.startsWith(`${to}/`)
  }

  function hasActiveChild(item: NavItem): boolean {
    if (isRouteActive(item.to)) return true
    return !!item.children?.some((c) => isRouteActive(c.to))
  }

  function sectionLabel(id: string, original: string): string {
    return GROUP_LABELS[id] ?? original
  }

  function badgeFor(id: string): SidebarBadge | null {
    if (id === 'clientes') return { value: 'Novo', tone: 'success' }
    if (id === 'whatsapp') return { value: 'Beta', tone: 'accent' }
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
