import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getNavItemsForRole, getNavSearchPlaceholder } from '@/constants/navigation'
import { filterNavItems } from '@/utils/filterNavItems'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { isClienteRole } from '@/types/user.types'

export function useDashboardNav() {
  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  const { profile } = storeToRefs(userStore)
  const { assinaturaAtiva } = storeToRefs(negocioStore)

  const navItems = computed(() => {
    const base = getNavItemsForRole(profile.value?.role)
    if (isClienteRole(profile.value?.role)) return base

    return filterNavItems(base, {
      assinaturaAtiva: assinaturaAtiva.value,
      possuiModulo: negocioStore.possuiModulo,
      possuiPermissao: negocioStore.possuiPermissao,
      possuiAlgumModulo: negocioStore.possuiAlgumModulo,
      possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    })
  })

  const searchPlaceholder = computed(() => getNavSearchPlaceholder(profile.value?.role))

  return { navItems, searchPlaceholder }
}
