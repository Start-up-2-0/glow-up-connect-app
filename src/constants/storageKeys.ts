export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'guc_access_token',
  REFRESH_TOKEN: 'guc_refresh_token',
  EXPIRES_AT: 'guc_expires_at',
  REFRESH_EXPIRES_AT: 'guc_refresh_expires_at',
  THEME: 'guc_theme',
  ESTABELECIMENTO_ID: 'guc_estabelecimento_id',
} as const

export const TOKEN_HEADER =
  import.meta.env.VITE_TOKEN_HEADER?.trim() || 'x-glow-token'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Glow Up Connect'
