/**
 * Helpers para montar o corpo das respostas mockadas.
 *
 * O body devolvido é passado intacto como `response.data` pelo adapter mock,
 * então o formato deve ser EXATAMENTE o que cada consumidor espera:
 *
 * - `ok()`   → `{ success, message, data }` (para services que usam `unwrap`).
 * - `okRaw()`→ body bruto, sem wrapper (ex.: `/usuario/me`, `/usuario/me/estabelecimentos`).
 * - `voidOk()`→ `{ success, message }` (ações sem payload de retorno).
 */

export function ok<T>(data: T) {
  return { success: true as const, message: 'ok', data }
}

export function okRaw<T>(data: T): T {
  return data
}

export function voidOk(message = 'ok') {
  return { success: true as const, message }
}

/** Corpo de erro no formato da API (`ApiErrorResponse`). */
export function error(code: string, message: string, status = 400, details?: unknown) {
  return { success: false as const, message, code, details, status }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
