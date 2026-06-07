import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const onboardingRoutes: RouteRecordRaw[] = [
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
]
