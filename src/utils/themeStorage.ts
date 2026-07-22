import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { Theme } from '@/types/theme.types'

/** Incrementar quando a identidade visual exigir reaplicar o tema padrão. */
export const CURRENT_THEME_VERSION = '2'

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

export const DEFAULT_THEME: Theme = 'dark'

export function migrateThemeIfNeeded(): void {
  if (typeof localStorage === 'undefined') return

  const storedVersion = localStorage.getItem(STORAGE_KEYS.THEME_VERSION)
  if (storedVersion === CURRENT_THEME_VERSION) return

  localStorage.setItem(STORAGE_KEYS.THEME, DEFAULT_THEME)
  localStorage.setItem(STORAGE_KEYS.THEME_VERSION, CURRENT_THEME_VERSION)
}

export function resolveStoredTheme(): Theme {
  migrateThemeIfNeeded()

  const saved = localStorage.getItem(STORAGE_KEYS.THEME)
  return isTheme(saved) ? saved : DEFAULT_THEME
}

export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function persistTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme)
  localStorage.setItem(STORAGE_KEYS.THEME_VERSION, CURRENT_THEME_VERSION)
}
