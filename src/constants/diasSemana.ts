export const DIAS_SEMANA = [
  { value: 'Sunday', label: 'Domingo' },
  { value: 'Monday', label: 'Segunda-feira' },
  { value: 'Tuesday', label: 'Terça-feira' },
  { value: 'Wednesday', label: 'Quarta-feira' },
  { value: 'Thursday', label: 'Quinta-feira' },
  { value: 'Friday', label: 'Sexta-feira' },
  { value: 'Saturday', label: 'Sábado' },
] as const

export type DiaSemanaValue = (typeof DIAS_SEMANA)[number]['value']

const DIA_LABEL_MAP = Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, d.label])) as Record<
  string,
  string
>

/** Rótulo PT-BR para valor retornado pela API (DayOfWeek em inglês). */
export function diaSemanaLabel(dia: string): string {
  return DIA_LABEL_MAP[dia] ?? dia
}

/** Normaliza input type="time" (HH:mm) para payload da API (HH:mm:ss). */
export function horaParaApi(hora: string): string {
  const trimmed = hora.trim()
  if (!trimmed) return trimmed
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed
}

/** Exibe hora da API (HH:mm:ss) como HH:mm. */
export function horaParaExibicao(hora: string): string {
  return hora.slice(0, 5)
}
