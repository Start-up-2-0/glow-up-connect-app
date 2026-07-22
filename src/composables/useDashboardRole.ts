import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { useNegocioStore } from '@/stores/negocio.store'

export type DashboardRole = 'cliente' | 'negocio' | 'profissional'

export function useDashboardRole() {
  const { temContextoOperacional, ehProfissionalOperacional, roleExibicao } = useAcessoUsuario()
  const negocioStore = useNegocioStore()
  const { role: roleLoja } = storeToRefs(negocioStore)

  const dashboardRole = computed((): DashboardRole => {
    if (ehProfissionalOperacional.value) return 'profissional'
    if (temContextoOperacional.value) return 'negocio'
    return 'cliente'
  })

  const ehGestorNegocio = computed(() =>
    roleLoja.value === 'Owner'
    || roleLoja.value === 'Admin'
    || roleLoja.value === 'Manager',
  )

  return {
    dashboardRole,
    ehGestorNegocio,
    roleExibicao,
    temContextoOperacional,
    ehProfissionalOperacional,
  }
}
