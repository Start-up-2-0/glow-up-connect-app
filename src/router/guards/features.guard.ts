import type { NavigationGuard } from 'vue-router'
import { FEATURE_FLAGS } from '@/config/features'
import { ROUTE_PATHS } from '@/constants/routes'
import { useNegocioStore } from '@/stores/negocio.store'

/** Impede deep links de loja na UI enquanto a flag estiver desligada. */
export const featuresGuard: NavigationGuard = async (to) => {
  if (FEATURE_FLAGS.lojasHabilitadas) return true

  if (to.query.tipoAssinatura === 'Estabelecimento') {
    return {
      path: to.path,
      query: { ...to.query, tipoAssinatura: 'ProfissionalAutonomo' },
      hash: to.hash,
      replace: true,
    }
  }

  if (to.path !== ROUTE_PATHS.MINHAS_LOJAS) return true

  const negocioStore = useNegocioStore()
  await negocioStore.ensureContext()
  if (negocioStore.tipoAssinatura === 'Estabelecimento') return true

  return { path: ROUTE_PATHS.DASHBOARD }
}
