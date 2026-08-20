/**
 * Flags de produto. Código permanece no repositório;
 * desligar aqui só oculta a experiência na UI.
 *
 * Reativar em runtime: variável VITE_* correspondente = true e rebuild.
 * Default local/dev: lojas habilitadas; troca de plano desabilitada.
 */
export const FEATURE_FLAGS = {
  lojasHabilitadas: import.meta.env.VITE_FEATURE_LOJAS !== 'false',
  /** Troca/upgrade de plano (fluxo Mercado Pago). Desligado até estabilizar a entrega. */
  trocaPlanoHabilitada: import.meta.env.VITE_FEATURE_TROCA_PLANO === 'true',
} as const
