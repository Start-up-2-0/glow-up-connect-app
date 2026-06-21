import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  businessNavItems,
  clienteNavItems,
  NAV_SEARCH_PLACEHOLDER_BUSINESS,
  NAV_SEARCH_PLACEHOLDER_CLIENTE,
  NAV_SEARCH_PLACEHOLDER_PROFISSIONAL,
  profissionalNavItems,
  type NavItem,
} from '@/constants/navigation'
import { filterNavItems } from '@/utils/filterNavItems'
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

function clienteNavSemAbrirLoja(items: NavItem[]): NavItem[] {
  return items
    .map((item) => {
      if (item.id !== 'cliente-conta' || !item.children?.length) return item
      const children = item.children.filter((child) => child.id !== 'abrir-loja')
      if (children.length === 0) return null
      return { ...item, children }
    })
    .filter((item): item is NavItem => item !== null)
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

  const navItems = computed(() => {
    const filterCtx = {
      assinaturaAtiva: assinaturaAtiva.value,
      possuiModulo: negocioStore.possuiModulo,
      possuiPermissao: negocioStore.possuiPermissao,
      possuiAlgumModulo: negocioStore.possuiAlgumModulo,
      possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    }

    const ocultarAbrirLoja =
      ehProfissionalOperacional.value || possuiEstabelecimentoProprio.value
    const clienteNav = ocultarAbrirLoja ? clienteNavSemAbrirLoja(clienteNavItems) : clienteNavItems

    if (ehProfissionalOperacional.value) {
      const operacao = filterNavItems(profissionalNavItems, filterCtx)
      return dedupeNavById([...clienteNav, ...operacao])
    }

    if (temVinculoNegocio.value) {
      const business = filterNavItems(
        businessNavItems.filter((item) => item.id !== 'dashboard'),
        filterCtx,
      )
      return dedupeNavById([...clienteNav, ...business])
    }

    if (!isClienteRole(profile.value?.role)) {
      return filterNavItems(businessNavItems, filterCtx)
    }

    return clienteNavItems
  })

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

  return { navItems, searchPlaceholder }
}
