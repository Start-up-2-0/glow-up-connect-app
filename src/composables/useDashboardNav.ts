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
import { FEATURE_FLAGS } from '@/config/features'
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
  const { assinaturaAtiva, ehProfissionalAutonomo, role, limites } = storeToRefs(negocioStore)
  const {
    temVinculoNegocio,
    ehProfissionalOperacional,
    possuiEstabelecimentoProprio,
  } = useAcessoUsuario()

  const navSections = computed(() => {
    const filterCtx = {
      assinaturaAtiva: assinaturaAtiva.value,
      ehProfissionalAutonomo: ehProfissionalAutonomo.value,
      ehOwner: role.value === 'Owner',
      permiteMultiLoja: (limites.value.estabelecimentos ?? 1) > 1,
      possuiModulo: negocioStore.possuiModulo,
      possuiPermissao: negocioStore.possuiPermissao,
      possuiAlgumModulo: negocioStore.possuiAlgumModulo,
      possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    }

    const ocultarAbrirLoja =
      !FEATURE_FLAGS.lojasHabilitadas
      || ehProfissionalOperacional.value
      || possuiEstabelecimentoProprio.value
    const clienteSections = ocultarAbrirLoja
      ? clienteNavSemAbrirLojaSections(clienteNavSections)
      : clienteNavSections

    if (ehProfissionalOperacional.value) {
      const operacao = filterNavSections(profissionalNavSections, filterCtx)
      return adaptLabelsCliente(
        mergeNavSections(
          filterNavSections(clienteSections, filterCtx),
          operacao,
        ),
      )
    }

    if (temVinculoNegocio.value) {
      return adaptLabels(filterNavSections(businessNavSections, filterCtx))
    }

    if (!isClienteRole(profile.value?.role)) {
      return adaptLabels(filterNavSections(businessNavSections, filterCtx))
    }

    return adaptLabelsCliente(filterNavSections(clienteSections, filterCtx))
  })

  function adaptLabelsAutonomo(sections: NavSection[]): NavSection[] {
    if (!ehProfissionalAutonomo.value) return sections
    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === 'perfil-estabelecimento'
          ? { ...item, label: 'Meu perfil' }
          : item,
      ),
    }))
  }

  function adaptLabelsExplorar(sections: NavSection[]): NavSection[] {
    if (FEATURE_FLAGS.lojasHabilitadas) return sections
    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === 'explorar' ? { ...item, label: 'Explorar profissionais' } : item,
      ),
    }))
  }

  function adaptLabels(sections: NavSection[]): NavSection[] {
    return adaptLabelsExplorar(adaptLabelsAutonomo(sections))
  }

  function adaptLabelsCliente(sections: NavSection[]): NavSection[] {
    return adaptLabelsExplorar(sections)
  }
  const navItems = computed(() => navSections.value.flatMap((section) => section.items))

  const searchPlaceholder = computed(() => {
    if (ehProfissionalOperacional.value) {
      return NAV_SEARCH_PLACEHOLDER_PROFISSIONAL
    }
    if (temVinculoNegocio.value) {
      return NAV_SEARCH_PLACEHOLDER_BUSINESS
    }
    return isClienteRole(profile.value?.role)
      ? FEATURE_FLAGS.lojasHabilitadas
        ? NAV_SEARCH_PLACEHOLDER_CLIENTE
        : 'Buscar profissionais, agendamentos, perfil…'
      : NAV_SEARCH_PLACEHOLDER_BUSINESS
  })

  return { navSections, navItems, searchPlaceholder }
}
