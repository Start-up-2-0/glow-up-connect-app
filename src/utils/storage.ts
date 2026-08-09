import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { StoredSession } from '@/types/auth.types'

function sessionStorageSafe() {
  return {
    get(key: string): string | null {
      try {
        return sessionStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(key: string, value: string): void {
      try {
        sessionStorage.setItem(key, value)
      } catch {
        // quota exceeded ou modo privado
      }
    },
    remove(key: string): void {
      try {
        sessionStorage.removeItem(key)
      } catch {
        // noop
      }
    },
  }
}

const session = sessionStorageSafe()

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

/** Metadados de sessão (sem segredos). Tokens ficam só em cookies HttpOnly. */
export function readStoredSession(): Partial<StoredSession> {
  const active = session.get(STORAGE_KEYS.SESSION_ACTIVE) === '1'
  if (!active) {
    return {}
  }

  return {
    token: '',
    refreshToken: '',
    expiresAt: session.get(STORAGE_KEYS.EXPIRES_AT) ?? undefined,
    refreshExpiresAt: session.get(STORAGE_KEYS.REFRESH_EXPIRES_AT) ?? undefined,
  }
}

export function persistSession(sessionData: StoredSession): void {
  session.set(STORAGE_KEYS.SESSION_ACTIVE, '1')
  session.set(STORAGE_KEYS.EXPIRES_AT, sessionData.expiresAt)
  session.set(STORAGE_KEYS.REFRESH_EXPIRES_AT, sessionData.refreshExpiresAt)
  // Limpa resíduos legados (nunca mais guardar tokens no browser storage).
  session.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
}

export function clearSessionStorage(): void {
  session.remove(STORAGE_KEYS.SESSION_ACTIVE)
  session.remove(STORAGE_KEYS.EXPIRES_AT)
  session.remove(STORAGE_KEYS.REFRESH_EXPIRES_AT)
  session.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
}

export function hasActiveSessionHint(): boolean {
  return session.get(STORAGE_KEYS.SESSION_ACTIVE) === '1'
}
