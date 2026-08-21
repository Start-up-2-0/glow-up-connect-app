/** Feature flags do Glow Guide — manter estrutura para reativar no futuro. */
export const GLOW_GUIDE_FLAGS = {
  /**
   * Quando true, sugere o tour na 1ª visita da página (dialog “Iniciar tutorial”).
   * Desativado: o usuário só inicia pelo botão manual do launcher.
   */
  autoSuggestOnFirstVisit: false,
} as const
