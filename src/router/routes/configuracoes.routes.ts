import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const configuracoesRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.CONFIG_ASSINATURA,
    name: ROUTE_NAMES.CONFIG_ASSINATURA,
    component: () => import('@/views/configuracoes/assinatura/AssinaturaView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Assinatura',
      requerPermissao: 'NegocioEditar',
      requerAssinaturaAtiva: false,
      title: 'Assinatura',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS,
    name: ROUTE_NAMES.CONFIG_ASSINATURA_FATURAS,
    component: () => import('@/views/configuracoes/assinatura/FaturasView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Assinatura',
      requerPermissao: 'NegocioEditar',
      requerAssinaturaAtiva: false,
      title: 'Faturas',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_ASSINATURA_UPGRADE,
    name: ROUTE_NAMES.CONFIG_ASSINATURA_UPGRADE,
    component: () => import('@/views/configuracoes/assinatura/AssinaturaUpgradeView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Assinatura',
      requerPermissao: 'NegocioEditar',
      requerAssinaturaAtiva: false,
      title: 'Trocar plano',
    },
  },
  {
    path: ROUTE_PATHS.UPGRADE,
    name: ROUTE_NAMES.UPGRADE,
    component: () => import('@/views/upgrade/UpgradeView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      skipNegocioGuard: true,
      title: 'Upgrade',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_AUDITORIA,
    name: ROUTE_NAMES.CONFIG_AUDITORIA,
    component: () => import('@/views/configuracoes/AuditoriaView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Financeiro',
      requerPermissao: 'NegocioVisualizar',
      title: 'Auditoria',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_PRIVACIDADE,
    name: ROUTE_NAMES.CONFIG_PRIVACIDADE,
    component: () => import('@/views/configuracoes/PrivacidadeView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      skipNegocioGuard: true,
      title: 'Privacidade',
    },
  },
]
