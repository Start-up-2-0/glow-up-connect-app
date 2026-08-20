import type { TargetRect } from '@/tutorials/types'

const DEFAULT_TIMEOUT_MS = 8000

export function isElementVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (typeof el.checkVisibility === 'function') {
    try {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
    } catch {
      // fallback abaixo
    }
  }
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  const rects = el.getClientRects()
  return rects.length > 0
}

export function findVisibleTarget(selector: string): HTMLElement | null {
  const nodes = document.querySelectorAll(selector)
  for (const node of nodes) {
    if (isElementVisible(node) && node instanceof HTMLElement) {
      return node
    }
  }
  return null
}

export function getTargetRect(el: HTMLElement, padding = 6): TargetRect {
  const r = el.getBoundingClientRect()
  const top = Math.max(0, r.top - padding)
  const left = Math.max(0, r.left - padding)
  const width = r.width + padding * 2
  const height = r.height + padding * 2
  return {
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export async function scrollTargetIntoView(
  el: HTMLElement,
  options?: { sheetHeight?: number },
): Promise<void> {
  const reduced = prefersReducedMotion()
  const sheetHeight = options?.sheetHeight ?? 0

  if (sheetHeight > 0) {
    const rect = el.getBoundingClientRect()
    const visibleBottom = window.innerHeight - sheetHeight
    const visibleCenter = visibleBottom / 2
    const targetCenter = rect.top + rect.height / 2
    const delta = targetCenter - visibleCenter
    if (Math.abs(delta) > 8) {
      const scroller =
        el.closest('.dashboard-main') ??
        document.scrollingElement ??
        document.documentElement
      scroller.scrollBy({
        top: delta,
        behavior: reduced ? 'auto' : 'smooth',
      })
      await waitForScrollSettle(reduced ? 0 : 320)
    }
    return
  }

  el.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  })
  await waitForScrollSettle(reduced ? 0 : 320)
}

function waitForScrollSettle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (ms <= 0) {
      resolve()
      return
    }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.removeEventListener('scrollend', finish)
      clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(finish, ms)
    window.addEventListener('scrollend', finish, { once: true })
  })
}

export function waitForVisibleTarget(
  selector: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<HTMLElement | null> {
  const existing = findVisibleTarget(selector)
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve) => {
    let settled = false
    const finish = (el: HTMLElement | null) => {
      if (settled) return
      settled = true
      observer.disconnect()
      clearTimeout(timer)
      resolve(el)
    }

    const observer = new MutationObserver(() => {
      const el = findVisibleTarget(selector)
      if (el) finish(el)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden'],
    })

    const timer = window.setTimeout(() => finish(null), timeoutMs)
  })
}
