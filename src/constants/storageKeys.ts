export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'guc_access_token',
  REFRESH_TOKEN: 'guc_refresh_token',
  SESSION_ACTIVE: 'guc_session_active',
  EXPIRES_AT: 'guc_expires_at',
  REFRESH_EXPIRES_AT: 'guc_refresh_expires_at',
  THEME: 'guc_theme',
  THEME_VERSION: 'guc_theme_version',
  ESTABELECIMENTO_ID: 'guc_estabelecimento_id',
  SIDEBAR_COLLAPSED: 'guc_sidebar_collapsed',
} as const

export const TOKEN_HEADER =
  import.meta.env.VITE_TOKEN_HEADER?.trim() || 'x-glow-token'

function normalizeApiBaseUrl(raw: string | undefined): string {
  const value = raw?.trim() || '/api'
  const withoutTrailingSlash = value.replace(/\/+$/, '')

  if (/^https?:\/\//i.test(withoutTrailingSlash) && !withoutTrailingSlash.endsWith('/api')) {
    return `${withoutTrailingSlash}/api`
  }

  return withoutTrailingSlash
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Glow Up Connect'
