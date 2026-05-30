import type { AuthTokens } from '@/types/auth.types'
import { persistSession } from './storage'

type SessionSyncCallback = (tokens: AuthTokens) => void

let syncCallback: SessionSyncCallback | null = null

export function registerSessionSyncCallback(callback: SessionSyncCallback): void {
  syncCallback = callback
}

export function syncSession(tokens: AuthTokens): void {
  persistSession(tokens)
  syncCallback?.(tokens)
}
