import type { RouteLocationRaw } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import type { LojaSetupMode } from '@/types/lojaSetup.types'

export function lojaSetupLocation(options: {
  mode: LojaSetupMode
  estabelecimentoId?: number | null
  assinaturaId?: number | null
}): RouteLocationRaw {
  const query: Record<string, string> = { mode: options.mode }
  if (options.estabelecimentoId) {
    query.estabelecimentoId = String(options.estabelecimentoId)
  }
  if (options.assinaturaId) {
    query.assinaturaId = String(options.assinaturaId)
  }
  return { path: ROUTE_PATHS.ONBOARDING_LOJA_SETUP, query }
}
