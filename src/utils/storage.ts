import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { StoredSession } from '@/types/auth.types'

export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // quota exceeded ou modo privado
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // noop
    }
  },

  clear(keys: string[]): void {
    keys.forEach((key) => storage.remove(key))
  },
}

export function readStoredSession(): Partial<StoredSession> {
  return {
    token: storage.get(STORAGE_KEYS.ACCESS_TOKEN) ?? undefined,
    refreshToken: storage.get(STORAGE_KEYS.REFRESH_TOKEN) ?? undefined,
    expiresAt: storage.get(STORAGE_KEYS.EXPIRES_AT) ?? undefined,
    refreshExpiresAt: storage.get(STORAGE_KEYS.REFRESH_EXPIRES_AT) ?? undefined,
  }
}

export function persistSession(session: StoredSession): void {
  storage.set(STORAGE_KEYS.ACCESS_TOKEN, session.token)
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken)
  storage.set(STORAGE_KEYS.EXPIRES_AT, session.expiresAt)
  storage.set(STORAGE_KEYS.REFRESH_EXPIRES_AT, session.refreshExpiresAt)
}

export function clearSessionStorage(): void {
  storage.clear([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.EXPIRES_AT,
    STORAGE_KEYS.REFRESH_EXPIRES_AT,
  ])
}

export function getAccessToken(): string | null {
  return storage.get(STORAGE_KEYS.ACCESS_TOKEN)
}

export function setAccessToken(token: string): void {
  storage.set(STORAGE_KEYS.ACCESS_TOKEN, token)
}
