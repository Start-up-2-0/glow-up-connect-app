/**
 * Flags de produto. Código de lojas permanece no repositório;
 * desligar aqui só oculta a experiência de TipoAssinatura.Estabelecimento.
 *
 * Reativar em runtime: VITE_FEATURE_LOJAS=true no ambiente e rebuild.
 * Default local/dev: lojas habilitadas.
 */
export const FEATURE_FLAGS = {
  lojasHabilitadas: import.meta.env.VITE_FEATURE_LOJAS !== 'false',
} as const
