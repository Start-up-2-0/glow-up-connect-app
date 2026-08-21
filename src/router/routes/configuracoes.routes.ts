import type { RouteRecordRaw } from 'vue-router'
import { FEATURE_FLAGS } from '@/config/features'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const configuracoesRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.MINHAS_LOJAS,
    name: ROUTE_NAMES.MINHAS_LOJAS,
    component: () => import('@/views/configuracoes/MinhasLojasView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerRoleOwner: true,
      requerMultiLoja: true,
      requerAssinaturaAtiva: true,
      title: 'Minhas lojas',
    },
  },
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
    beforeEnter: () => {
      // Troca de plano ocultada até estabilizar o fluxo de cobrança.
      if (!FEATURE_FLAGS.trocaPlanoHabilitada) {
        return { path: ROUTE_PATHS.CONFIG_ASSINATURA }
      }
      return true
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
