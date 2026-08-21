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

export function getOntemRange() {
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  const date = toDateOnly(ontem)
  return { inicio: startOfDayIso(date), fim: endOfDayIso(date) }
}

export function getUltimos7DiasRange() {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - 6)
  return {
    inicio: startOfDayIso(toDateOnly(inicio)),
    fim: endOfDayIso(toDateOnly(fim)),
  }
}

export function getUltimos30DiasRange() {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - 29)
  return {
    inicio: startOfDayIso(toDateOnly(inicio)),
    fim: endOfDayIso(toDateOnly(fim)),
  }
}

export function getMesAnteriorRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return {
    inicio: startOfDayIso(toDateOnly(start)),
    fim: endOfDayIso(toDateOnly(end)),
  }
}

export function getSemanaAtualRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  return {
    inicio: startOfDayIso(toDateOnly(start)),
    fim: endOfDayIso(toDateOnly(now)),
  }
}
