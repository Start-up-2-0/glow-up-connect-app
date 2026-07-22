export const CEP_LENGTH = 8

export function normalizeCep(cep: string | null | undefined): string {
  if (!cep) return ''
  return cep.replace(/\D/g, '').slice(0, CEP_LENGTH)
}

export function maskCep(digits: string): string {
  const normalized = normalizeCep(digits)
  if (normalized.length <= 5) return normalized
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`
}

export function cepToApi(cep: string | null | undefined): string {
  return normalizeCep(cep)
}

export function isValidCep(cep: string | null | undefined): boolean {
  return normalizeCep(cep).length === CEP_LENGTH
}

const UFS_VALIDAS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
])

export function normalizeUf(estado: string | null | undefined): string {
  return (estado ?? '').trim().toUpperCase().slice(0, 2)
}

export function isValidUf(estado: string | null | undefined): boolean {
  return UFS_VALIDAS.has(normalizeUf(estado))
}

export function cepFromInput(value: string): string {
  return normalizeCep(value)
}
