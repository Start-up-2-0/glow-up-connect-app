/**
 * Flags de produto. Código de lojas permanece no repositório;
 * desligar aqui só oculta a experiência de TipoAssinatura.Estabelecimento.
 *
 * Reativar: VITE_FEATURE_LOJAS=true no ambiente e rebuild.
 */
export const FEATURE_FLAGS = {
  lojasHabilitadas: import.meta.env.VITE_FEATURE_LOJAS === 'true',
} as const
