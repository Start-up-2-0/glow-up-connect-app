/** Contador de locks para evitar scroll residual quando vários modais abrem/fecham. */
let lockCount = 0
let previousOverflow = ''

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.classList.add('guc-scroll-locked')
  }
  lockCount += 1
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  if (lockCount <= 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow
    previousOverflow = ''
    document.documentElement.classList.remove('guc-scroll-locked')
  }
}

/** Força liberação (ex.: retomada após longa inatividade). */
export function forceUnlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  lockCount = 0
  document.body.style.overflow = ''
  previousOverflow = ''
  document.documentElement.classList.remove('guc-scroll-locked')
}
