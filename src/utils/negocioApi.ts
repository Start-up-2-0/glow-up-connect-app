export function negocioPath(estabelecimentoId: number, suffix: string): string {
  const path = suffix.startsWith('/') ? suffix : `/${suffix}`
  return `/estabelecimentos/${estabelecimentoId}${path}`
}
