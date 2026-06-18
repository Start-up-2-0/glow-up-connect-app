/** Mesma regra de exibição do backend (estilo iFood). */
export function formatNotaMediaIfood(mediaBruta: number): number {
  if (mediaBruta <= 0) return 0

  const centesimo = Math.floor(mediaBruta * 100) % 10
  const decimos = Math.floor(mediaBruta * 10)

  return centesimo <= 5 ? decimos / 10 : Math.ceil(mediaBruta * 10) / 10
}

export function formatNotaMediaDisplay(nota: number | null | undefined): string {
  if (nota == null || nota <= 0) return '0,0'
  return formatNotaMediaIfood(nota).toFixed(1).replace('.', ',')
}
