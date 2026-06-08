import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.ONBOARDING_PLANOS,
    name: ROUTE_NAMES.ONBOARDING_PLANOS,
    component: () => import('@/views/onboarding/PlanosView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      assinaturaOnboardingLogado: true,
      skipNegocioGuard: true,
      title: 'Planos',
    },
  },
  {
    path: ROUTE_PATHS.ONBOARDING_CONTRATAR,
    name: ROUTE_NAMES.ONBOARDING_CONTRATAR,
    component: () => import('@/views/onboarding/AssinaturaContaAtivaView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      assinaturaOnboardingLogado: true,
      skipNegocioGuard: true,
      title: 'Contratar plano',
    },
  },
  {
    path: ROUTE_PATHS.ONBOARDING_ASSINATURA,
    name: ROUTE_NAMES.ONBOARDING_ASSINATURA,
    component: () => import('@/views/onboarding/OnboardingAssinaturaView.vue'),
    meta: {
      layout: 'auth',
      onboardingAssinatura: true,
      skipNegocioGuard: true,
      title: 'Contratar plano',
    },
  },
  {
    path: ROUTE_PATHS.ONBOARDING_CHECKOUT,
    redirect: (to) => ({
      path: ROUTE_PATHS.ONBOARDING_ASSINATURA,
      query: to.query,
    }),
  },
  {
    path: ROUTE_PATHS.ASSINATURA_PAGAMENTO_SUCESSO,
    name: ROUTE_NAMES.ASSINATURA_PAGAMENTO_SUCESSO,
    component: () => import('@/views/assinatura/AssinaturaPagamentoRetornoView.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      skipNegocioGuard: true,
      title: 'Pagamento aprovado',
    },
  },
  {
    path: ROUTE_PATHS.ASSINATURA_PAGAMENTO_PENDENTE,
    name: ROUTE_NAMES.ASSINATURA_PAGAMENTO_PENDENTE,
    component: () => import('@/views/assinatura/AssinaturaPagamentoRetornoView.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      skipNegocioGuard: true,
      title: 'Pagamento pendente',
    },
  },
  {
    path: ROUTE_PATHS.ASSINATURA_PAGAMENTO_FALHA,
    name: ROUTE_NAMES.ASSINATURA_PAGAMENTO_FALHA,
    component: () => import('@/views/assinatura/AssinaturaPagamentoRetornoView.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      skipNegocioGuard: true,
      title: 'Pagamento não concluído',
    },
  },
]
