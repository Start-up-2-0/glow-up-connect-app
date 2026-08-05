import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  businessNavSections,
  clienteNavSections,
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

function dedupeNavById(items: NavItem[]): NavItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function mergeNavSections(...groups: NavSection[][]): NavSection[] {
  const map = new Map<string, NavSection>()

  for (const sections of groups) {
    for (const section of sections) {
      const existing = map.get(section.id)
      if (existing) {
        existing.items = dedupeNavById([...existing.items, ...section.items])
      } else {
        map.set(section.id, { ...section, items: [...section.items] })
      }
    }
  }

  return Array.from(map.values())
}

function clienteNavSemAbrirLoja(items: NavItem[]): NavItem[] {
  return items
    .filter((item) => item.id !== 'abrir-loja')
    .map((item) => {
      if (item.id !== 'cliente-conta' || !item.children?.length) return item
      const children = item.children.filter((child) => child.id !== 'abrir-loja')
      if (children.length === 0) return null
      return { ...item, children }
    })
    .filter((item): item is NavItem => item !== null)
}

function clienteNavSemAbrirLojaSections(sections: NavSection[]): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: clienteNavSemAbrirLoja(section.items),
    }))
    .filter((section) => section.items.length > 0)
}

export function useDashboardNav() {
  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  const { profile } = storeToRefs(userStore)
  const { assinaturaAtiva } = storeToRefs(negocioStore)
  const {
    temVinculoNegocio,
    ehProfissionalOperacional,
    possuiEstabelecimentoProprio,
  } = useAcessoUsuario()

  const navSections = computed(() => {
    const filterCtx = {
      assinaturaAtiva: assinaturaAtiva.value,
      possuiModulo: negocioStore.possuiModulo,
      possuiPermissao: negocioStore.possuiPermissao,
      possuiAlgumModulo: negocioStore.possuiAlgumModulo,
      possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    }

    const ocultarAbrirLoja =
      ehProfissionalOperacional.value || possuiEstabelecimentoProprio.value
    const clienteSections = ocultarAbrirLoja
      ? clienteNavSemAbrirLojaSections(clienteNavSections)
      : clienteNavSections

    if (ehProfissionalOperacional.value) {
      const operacao = filterNavSections(profissionalNavSections, filterCtx)
      return mergeNavSections(
        filterNavSections(clienteSections, filterCtx),
        operacao,
      )
    }

    if (temVinculoNegocio.value) {
      return filterNavSections(businessNavSections, filterCtx)
    }

    if (!isClienteRole(profile.value?.role)) {
      return filterNavSections(businessNavSections, filterCtx)
    }

    return filterNavSections(clienteSections, filterCtx)
  })

  const navItems = computed(() => navSections.value.flatMap((section) => section.items))

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

  return { navSections, navItems, searchPlaceholder }
}
