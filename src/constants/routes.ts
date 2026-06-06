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
  EXPLORAR: 'explorar',
  MEUS_AGENDAMENTOS: 'meus-agendamentos',
  CONVITES: 'convites',
  CONVITE_RESPONDER: 'convite-responder',
  PERFIL: 'perfil',
  LOJA_DETALHE: 'loja-detalhe',
  LOJA_AGENDAR: 'loja-agendar',
  AGENDAMENTO_DETALHE: 'agendamento-detalhe',
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
  EXPLORAR: '/explorar',
  MEUS_AGENDAMENTOS: '/meus-agendamentos',
  CONVITES: '/convites',
  PERFIL: '/perfil',
  LOJA: '/loja',
  MEUS_AGENDAMENTOS_DETALHE: '/meus-agendamentos',
} as const

export function lojaDetalhePath(publicGuid: string): string {
  return `${ROUTE_PATHS.LOJA}/${publicGuid}`
}

export function lojaAgendarPath(publicGuid: string): string {
  return `${ROUTE_PATHS.LOJA}/${publicGuid}/agendar`
}

export function agendamentoDetalhePath(id: number): string {
  return `${ROUTE_PATHS.MEUS_AGENDAMENTOS_DETALHE}/${id}`
}

export function conviteResponderPath(token: string): string {
  return `${ROUTE_PATHS.CONVITES}/${encodeURIComponent(token)}`
}

export type AppLayout = 'auth' | 'dashboard'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: AppLayout
    requiresAuth?: boolean
    guestOnly?: boolean
    /** Apenas usuários com role Cliente */
    clienteOnly?: boolean
    /** Rotas operacionais — bloqueadas para Cliente */
    businessOnly?: boolean
    title?: string
  }
}
