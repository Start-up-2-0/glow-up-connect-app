import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { StoredSession } from '@/types/auth.types'

const memoryAccessToken: { value: string | null } = { value: null }

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

export function readStoredSession(): Partial<StoredSession> {
  const token = memoryAccessToken.value ?? session.get(STORAGE_KEYS.ACCESS_TOKEN) ?? undefined
  return {
    token,
    expiresAt: session.get(STORAGE_KEYS.EXPIRES_AT) ?? undefined,
    refreshExpiresAt: session.get(STORAGE_KEYS.REFRESH_EXPIRES_AT) ?? undefined,
  }
}

export function persistSession(sessionData: StoredSession): void {
  memoryAccessToken.value = sessionData.token
  session.set(STORAGE_KEYS.ACCESS_TOKEN, sessionData.token)
  session.set(STORAGE_KEYS.EXPIRES_AT, sessionData.expiresAt)
  session.set(STORAGE_KEYS.REFRESH_EXPIRES_AT, sessionData.refreshExpiresAt)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
}

export function clearSessionStorage(): void {
  memoryAccessToken.value = null
  session.remove(STORAGE_KEYS.ACCESS_TOKEN)
  session.remove(STORAGE_KEYS.EXPIRES_AT)
  session.remove(STORAGE_KEYS.REFRESH_EXPIRES_AT)
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
}

export function getAccessToken(): string | null {
  return memoryAccessToken.value ?? session.get(STORAGE_KEYS.ACCESS_TOKEN)
}

export function setAccessToken(token: string): void {
  memoryAccessToken.value = token
  session.set(STORAGE_KEYS.ACCESS_TOKEN, token)
}
