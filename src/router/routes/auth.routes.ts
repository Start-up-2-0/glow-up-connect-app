import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

const confirmEmailLegacyRedirects: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.CONFIRM_EMAIL_LEGACY,
    redirect: (to) => ({
      path: ROUTE_PATHS.CONFIRM_EMAIL,
      query: to.query,
    }),
  },
  {
    path: `${ROUTE_PATHS.CONFIRM_EMAIL_LEGACY}/codigo`,
    redirect: (to) => ({
      path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
      query: to.query,
    }),
  },
  {
    path: `${ROUTE_PATHS.CONFIRM_EMAIL_LEGACY}/sucesso`,
    redirect: ROUTE_PATHS.CONFIRM_EMAIL_SUCCESS,
  },
]

export const authRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Entrar' },
  },
  {
    path: ROUTE_PATHS.REGISTER,
    name: ROUTE_NAMES.REGISTER,
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Cadastro' },
  },
  {
    path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
    name: ROUTE_NAMES.CONFIRM_EMAIL_CODE,
    component: () => import('@/views/auth/ConfirmEmailCodeView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Confirmar e-mail' },
  },
  {
    path: ROUTE_PATHS.CONFIRM_EMAIL_SUCCESS,
    name: ROUTE_NAMES.CONFIRM_EMAIL_SUCCESS,
    component: () => import('@/views/auth/ConfirmEmailSuccessView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'E-mail confirmado' },
  },
  {
    path: ROUTE_PATHS.CONFIRM_EMAIL,
    name: ROUTE_NAMES.CONFIRM_EMAIL,
    component: () => import('@/views/auth/ConfirmEmailView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Confirmar e-mail' },
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD,
    name: ROUTE_NAMES.FORGOT_PASSWORD,
    component: () => import('@/views/auth/ForgotPasswordEmailView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Esqueci a senha' },
  },
  {
    path: ROUTE_PATHS.FORGOT_PASSWORD_CODE,
    name: ROUTE_NAMES.FORGOT_PASSWORD_CODE,
    component: () => import('@/views/auth/ForgotPasswordCodeView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Verificar código' },
  },
  {
    path: ROUTE_PATHS.RESET_PASSWORD,
    name: ROUTE_NAMES.RESET_PASSWORD,
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Redefinir senha' },
  },
  {
    path: ROUTE_PATHS.RESET_PASSWORD_SUCCESS,
    name: ROUTE_NAMES.RESET_PASSWORD_SUCCESS,
    component: () => import('@/views/auth/ResetPasswordSuccessView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Senha redefinida' },
  },
  ...confirmEmailLegacyRedirects,
]
