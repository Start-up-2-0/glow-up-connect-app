import type { PopoverPlacement, TargetRect, TutorialLayoutMode } from '@/tutorials/types'

const MD = 768
const LG = 1024
const CARD_W = 340
const CARD_H = 220
const GAP = 12
const EDGE = 8

export function resolveLayoutMode(
  target: TargetRect | null,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
): TutorialLayoutMode {
  if (viewportWidth < MD) return 'sheet'

  if (viewportWidth < LG && target) {
    const spaceBottom = viewportHeight - target.bottom
    const spaceTop = target.top
    const spaceRight = viewportWidth - target.right
    const spaceLeft = target.left
    const maxSpace = Math.max(spaceBottom, spaceTop, spaceRight, spaceLeft)
    if (maxSpace < CARD_H + GAP) return 'sheet'
  }

  return 'popover'
}

export function estimateSheetHeight(viewportHeight = window.innerHeight): number {
  return Math.min(Math.round(viewportHeight * 0.48), 360)
}

export interface PopoverPosition {
  top: number
  left: number
  placement: PopoverPlacement
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function sidebarOffset(): number {
  if (window.innerWidth < MD) return 0
  const collapsed = document.documentElement.classList.contains('sidebar-collapsed')
  // shell usa md:ml-64 (256) / collapsed ~72
  return collapsed ? 72 : 256
}

export function computePopoverPosition(
  target: TargetRect,
  cardWidth = CARD_W,
  cardHeight = CARD_H,
): PopoverPosition {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const leftMin = sidebarOffset() + EDGE
  const leftMax = vw - cardWidth - EDGE
  const topMax = vh - cardHeight - EDGE

  const candidates: Array<{ placement: PopoverPlacement; top: number; left: number; score: number }> = [
    {
      placement: 'bottom',
      top: target.bottom + GAP,
      left: clamp(target.left + target.width / 2 - cardWidth / 2, leftMin, leftMax),
      score: vh - (target.bottom + GAP + cardHeight),
    },
    {
      placement: 'right',
      top: clamp(target.top + target.height / 2 - cardHeight / 2, EDGE, topMax),
      left: target.right + GAP,
      score: vw - (target.right + GAP + cardWidth),
    },
    {
      placement: 'left',
      top: clamp(target.top + target.height / 2 - cardHeight / 2, EDGE, topMax),
      left: target.left - GAP - cardWidth,
      score: target.left - GAP - cardWidth - leftMin,
    },
    {
      placement: 'top',
      top: target.top - GAP - cardHeight,
      left: clamp(target.left + target.width / 2 - cardWidth / 2, leftMin, leftMax),
      score: target.top - GAP - cardHeight - EDGE,
    },
  ]

  const order: PopoverPlacement[] = ['bottom', 'right', 'left', 'top']
  let best = candidates[0]
  for (const placement of order) {
    const c = candidates.find((x) => x.placement === placement)!
    if (c.score >= 0) {
      best = c
      break
    }
    if (c.score > best.score) best = c
  }

  return {
    placement: best.placement,
    top: clamp(best.top, EDGE, Math.max(EDGE, topMax)),
    left: clamp(best.left, leftMin, Math.max(leftMin, leftMax)),
  }
}

/** Expande o hole para hit area mínima em touch (~44px). */
export function expandHitRect(rect: TargetRect, minSize = 44): TargetRect {
  const width = Math.max(rect.width, minSize)
  const height = Math.max(rect.height, minSize)
  const left = rect.left - (width - rect.width) / 2
  const top = rect.top - (height - rect.height) / 2
  return {
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
  }
}
