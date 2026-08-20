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

/** Aliases PT-BR / variações → DayOfWeek inglês (API .NET). */
const DIA_ALIASES: Record<string, DiaSemanaValue> = {
  Sunday: 'Sunday',
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Domingo: 'Sunday',
  Segunda: 'Monday',
  'Segunda-feira': 'Monday',
  Terca: 'Tuesday',
  Terça: 'Tuesday',
  'Terça-feira': 'Tuesday',
  Quarta: 'Wednesday',
  'Quarta-feira': 'Wednesday',
  Quinta: 'Thursday',
  'Quinta-feira': 'Thursday',
  Sexta: 'Friday',
  'Sexta-feira': 'Friday',
  Sabado: 'Saturday',
  Sábado: 'Saturday',
}

/** Normaliza valor de dia da API/mock para o enum inglês. */
export function normalizarDiaSemana(dia: string): DiaSemanaValue | null {
  if (!dia) return null
  return DIA_ALIASES[dia] ?? DIA_ALIASES[dia.trim()] ?? null
}

/** Rótulo PT-BR para valor retornado pela API (DayOfWeek em inglês). */
export function diaSemanaLabel(dia: string): string {
  const normalizado = normalizarDiaSemana(dia)
  if (normalizado) return DIA_LABEL_MAP[normalizado]
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
