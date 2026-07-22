import { authService } from '@/services/authService'
import { readStoredSession } from '@/utils/storage'
import { syncSession } from '@/utils/sessionSync'

const REFRESH_MARGIN_MS = 60_000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function clearRefreshTimer(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

async function performRefresh(): Promise<void> {
  const { data } = await authService.refresh()
  syncSession({
    token: data.data.token,
    refreshToken: '',
    expiresAt: data.data.expiresAt,
    refreshExpiresAt: data.data.refreshExpiresAt,
  })
}

export function startSessionRefreshScheduler(): void {
  clearRefreshTimer()

  const { expiresAt } = readStoredSession()
  if (!expiresAt) return

  const expiresMs = new Date(expiresAt).getTime()
  if (Number.isNaN(expiresMs)) return

  const delay = expiresMs - Date.now() - REFRESH_MARGIN_MS
  const wait = Math.max(delay, 0)

  refreshTimer = setTimeout(async () => {
    try {
      await performRefresh()
      startSessionRefreshScheduler()
    } catch {
      clearRefreshTimer()
    }
  }, wait)
}

export function stopSessionRefreshScheduler(): void {
  clearRefreshTimer()
}
