export const ROUTE_NAMES = {
  LOGIN: 'login',
  REGISTER: 'register',
  CONFIRM_EMAIL: 'confirm-email',
  CONFIRM_EMAIL_CODE: 'confirm-email-code',
  CONFIRM_EMAIL_SUCCESS: 'confirm-email-success',
  FORGOT_PASSWORD: 'forgot-password',
  FORGOT_PASSWORD_CODE: 'forgot-password-code',
  RESET_PASSWORD: 'reset-password',
  RESET_PASSWORD_SUCCESS: 'reset-password-success',
  DASHBOARD_HOME: 'dashboard-home',
  NOT_FOUND: 'not-found',
} as const

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CONFIRM_EMAIL: '/auth/confirmar-email',
  CONFIRM_EMAIL_CODE: '/auth/confirmar-email/codigo',
  CONFIRM_EMAIL_SUCCESS: '/auth/confirmar-email/sucesso',
  /** Alias legado — links gerados pelo backend com FrontendBaseUrl na raiz do app */
  CONFIRM_EMAIL_LEGACY: '/confirmar-email',
  FORGOT_PASSWORD: '/auth/esqueci-senha',
  FORGOT_PASSWORD_CODE: '/auth/esqueci-senha/codigo',
  RESET_PASSWORD: '/auth/redefinir-senha',
  RESET_PASSWORD_SUCCESS: '/auth/redefinir-senha/sucesso',
  DASHBOARD: '/dashboard',
} as const

export type AppLayout = 'auth' | 'dashboard'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: AppLayout
    requiresAuth?: boolean
    guestOnly?: boolean
    title?: string
  }
}
