import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'

export function estabelecimentoTemCoordenadas(
  item: EstabelecimentoProximo,
): item is EstabelecimentoProximo & { latitude: number; longitude: number } {
  return (
    typeof item.latitude === 'number' &&
    Number.isFinite(item.latitude) &&
    typeof item.longitude === 'number' &&
    Number.isFinite(item.longitude)
  )
}

export function formatEnderecoMapa(item: EstabelecimentoProximo): string {
  const parts = [item.endereco?.logradouro, item.endereco?.bairro].filter(Boolean)
  return parts.join(' · ') || 'Endereço não informado'
}

/** Distância em metros entre dois pontos (Haversine). */
export function distanciaMetros(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6_371_000
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}
