import { FEATURE_FLAGS } from '@/config/features'
import type { TipoAssinatura } from '@/types/assinatura.types'

export const TIPO_ASSINATURA_PADRAO: TipoAssinatura = FEATURE_FLAGS.lojasHabilitadas
  ? 'Estabelecimento'
  : 'ProfissionalAutonomo'

export function resolveTipoAssinatura(value?: string | null): TipoAssinatura {
  if (!FEATURE_FLAGS.lojasHabilitadas) return 'ProfissionalAutonomo'
  return value === 'ProfissionalAutonomo' ? 'ProfissionalAutonomo' : 'Estabelecimento'
}

/** Marketplace público: oculta estabelecimentos/lojas enquanto a flag estiver desligada. */
export function visivelNoMarketplace(item: {
  tipoAssinatura?: TipoAssinatura | string | null
}): boolean {
  if (FEATURE_FLAGS.lojasHabilitadas) return true
  return item.tipoAssinatura === 'ProfissionalAutonomo'
}

export function tipoAssinaturaParaCategorias(): TipoAssinatura | undefined {
  return FEATURE_FLAGS.lojasHabilitadas ? undefined : 'ProfissionalAutonomo'
}
