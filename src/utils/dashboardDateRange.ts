function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function startOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}

export function endOfDayIso(dateStr: string): string {
  return new Date(`${dateStr}T23:59:59`).toISOString()
}

export function getHojeRange() {
  const hoje = toDateOnly(new Date())
  return { inicio: startOfDayIso(hoje), fim: endOfDayIso(hoje) }
}

export function getMesAtualRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const hoje = toDateOnly(now)
  return {
    inicio: startOfDayIso(toDateOnly(start)),
    fim: endOfDayIso(hoje),
  }
}
