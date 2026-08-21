import { forceUnlockBodyScroll } from '@/utils/bodyScrollLock'

/** Tempo mínimo em background para disparar recuperação completa. */
const LONG_IDLE_MS = 2 * 60_000
/** Aba oculta por pouco tempo ainda revalida sessão se o token já expirou. */
const SHORT_IDLE_MS = 15_000

export const APP_RESUMED_EVENT = 'guc:app-resumed'

let lastHiddenAt = 0
let registered = false

function hiddenDurationMs(): number {
  if (!lastHiddenAt) return 0
  return Date.now() - lastHiddenAt
}

async function recoverUiState(idleMs: number): Promise<void> {
  forceUnlockBodyScroll()

  try {
    const { useLoadingStore } = await import('@/stores/loading.store')
    const loading = useLoadingStore()
    if (loading.visible || loading.pending > 0 || loading.navInFlight) {
      loading.hide()
    }
  } catch {
    /* store pode não estar pronta no boot extremo */
  }

  try {
    const { useAppStore } = await import('@/stores/app.store')
    const appStore = useAppStore()
    if (appStore.sidebarOpen && idleMs >= SHORT_IDLE_MS) {
      appStore.setSidebarOpen(false)
    }
  } catch {
    /* ignore */
  }

  try {
    const { useTutorialStore } = await import('@/stores/tutorial.store')
    const tutorial = useTutorialStore()
    if (tutorial.isActive) {
      const stuckWithoutTarget =
        !tutorial.targetRect && !tutorial.isResolvingTarget && idleMs >= SHORT_IDLE_MS
      if (idleMs >= LONG_IDLE_MS || stuckWithoutTarget) {
        // Overlay full-screen sem target (ou idle longo) bloqueia cliques até F5.
        tutorial.abandon()
      }
    }
    if (tutorial.showResumeDialog) tutorial.cancelResumeDialog()
    if (tutorial.showExitDialog) tutorial.cancelExitDialog()
    if (tutorial.showSuggestion) tutorial.dismissSuggestion()
  } catch {
    /* ignore */
  }

  if (idleMs >= SHORT_IDLE_MS) {
    document.body.classList.remove('guc-mobile-drawer-open')
  }
}

async function recoverSessionAndProof(idleMs: number): Promise<void> {
  try {
    const { invalidateRequestProofPool, ensureRequestProofPool } = await import(
      '@/composables/useRequestProof'
    )
    if (idleMs >= SHORT_IDLE_MS) {
      invalidateRequestProofPool()
      void ensureRequestProofPool()
    }
  } catch {
    /* ignore */
  }

  try {
    const { useAuthStore } = await import('@/stores/auth.store')
    const { startSessionRefreshScheduler, ensureSessionFreshOnResume } = await import(
      '@/composables/useSessionRefresh'
    )
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
      await ensureSessionFreshOnResume()
      startSessionRefreshScheduler()
    }
  } catch {
    /* ignore */
  }
}

async function onResume(reason: 'visibility' | 'pageshow' | 'online' | 'focus'): Promise<void> {
  const idleMs = hiddenDurationMs()
  lastHiddenAt = 0

  // Sempre limpa locks/overlays leves; sessão/proof só após idle relevante.
  await recoverUiState(idleMs)

  if (idleMs >= SHORT_IDLE_MS || reason === 'online') {
    await recoverSessionAndProof(Math.max(idleMs, SHORT_IDLE_MS))
  }

  window.dispatchEvent(
    new CustomEvent(APP_RESUMED_EVENT, {
      detail: { idleMs, reason },
    }),
  )
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    lastHiddenAt = Date.now()
    return
  }
  void onResume('visibility')
}

function onPageShow(event: PageTransitionEvent): void {
  if (event.persisted || document.visibilityState === 'visible') {
    void onResume('pageshow')
  }
}

function onOnline(): void {
  void onResume('online')
}

/**
 * Recupera a SPA após longa inatividade / background (mobile), sem reload completo.
 * Deve ser registrado uma vez no boot do cliente.
 */
export function registerAppLifecycleRecovery(): void {
  if (typeof window === 'undefined' || registered) return
  registered = true

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pageshow', onPageShow)
  window.addEventListener('online', onOnline)
}
