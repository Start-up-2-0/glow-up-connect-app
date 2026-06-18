import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  businessNavSections,
  clienteNavSections,
  flattenNavSections,
  NAV_SEARCH_PLACEHOLDER_BUSINESS,
  NAV_SEARCH_PLACEHOLDER_CLIENTE,
  NAV_SEARCH_PLACEHOLDER_PROFISSIONAL,
  profissionalNavSections,
  type NavItem,
  type NavSection,
} from '@/constants/navigation'
import { filterNavSections } from '@/utils/filterNavItems'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { isClienteRole } from '@/types/user.types'

function omitSectionItems(section: NavSection, itemIds: string[]): NavSection {
  return {
    ...section,
    items: section.items.filter((item) => !itemIds.includes(item.id)),
  }
}

function omitSectionsById(sections: NavSection[], sectionIds: string[]): NavSection[] {
  return sections.filter((section) => !sectionIds.includes(section.id))
}

function dedupeNavById(items: NavItem[]): NavItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function flattenNavItemsForCollapsed(items: NavItem[]): NavItem[] {
  const leaves: NavItem[] = []

  for (const item of items) {
    if (item.children?.length) {
      for (const child of item.children) {
        if (!child.to) continue
        leaves.push({
          id: child.id,
          label: child.label,
          to: child.to,
          icon: item.icon,
        })
      }
      continue
    }

    if (item.to) leaves.push(item)
  }

  return dedupeNavById(leaves)
}

export function useDashboardNav() {
  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  const { profile } = storeToRefs(userStore)
  const { assinaturaAtiva } = storeToRefs(negocioStore)
  const { temVinculoNegocio, ehProfissionalOperacional } = useAcessoUsuario()

  const filterCtx = computed(() => ({
    assinaturaAtiva: assinaturaAtiva.value,
    possuiModulo: negocioStore.possuiModulo,
    possuiPermissao: negocioStore.possuiPermissao,
    possuiAlgumModulo: negocioStore.possuiAlgumModulo,
    possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
  }))

  const navSections = computed(() => {
    const ctx = filterCtx.value

    if (ehProfissionalOperacional.value) {
      const cliente = filterNavSections(
        clienteNavSections.map((section) => omitSectionItems(section, ['abrir-loja'])),
        ctx,
      )
      const operacao = filterNavSections(profissionalNavSections, ctx)
      return [...cliente, ...operacao]
    }

    if (temVinculoNegocio.value) {
      const cliente = filterNavSections(clienteNavSections, ctx)
      const business = filterNavSections(
        omitSectionsById(businessNavSections, ['dashboard']),
        ctx,
      )
      return [...cliente, ...business]
    }

    if (!isClienteRole(profile.value?.role)) {
      return filterNavSections(businessNavSections, ctx)
    }

    return filterNavSections(clienteNavSections, ctx)
  })

  const navItems = computed(() => dedupeNavById(flattenNavSections(navSections.value)))

  const collapsedNavItems = computed(() => flattenNavItemsForCollapsed(navItems.value))

  const searchPlaceholder = computed(() => {
    if (ehProfissionalOperacional.value) {
      return NAV_SEARCH_PLACEHOLDER_PROFISSIONAL
    }
    if (temVinculoNegocio.value) {
      return NAV_SEARCH_PLACEHOLDER_BUSINESS
    }
    return isClienteRole(profile.value?.role)
      ? NAV_SEARCH_PLACEHOLDER_CLIENTE
      : NAV_SEARCH_PLACEHOLDER_BUSINESS
  })

  return { navSections, navItems, collapsedNavItems, searchPlaceholder }
}
