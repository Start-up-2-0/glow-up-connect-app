/**
 * Configuração do modo mockado.
 *
 * Ativado pela flag de ambiente `VITE_USE_MOCKS=true` (ver `.env.mock`).
 * Quando ligado, todas as chamadas HTTP do `api` são interceptadas e
 * respondidas com dados fictícios (sem tocar no servidor real).
 */
export const MOCK_MODE = import.meta.env.VITE_USE_MOCKS === 'true'

/** Latência simulada (ms) para deixar os loadings das telas visíveis. */
export const MOCK_LATENCY_MS = 180
