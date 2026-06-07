import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.ONBOARDING_PLANOS,
    name: ROUTE_NAMES.ONBOARDING_PLANOS,
    component: () => import('@/views/onboarding/PlanosView.vue'),
    meta: { layout: 'public', skipNegocioGuard: true, title: 'Planos' },
  },
  {
    path: ROUTE_PATHS.ONBOARDING_CHECKOUT,
    name: ROUTE_NAMES.ONBOARDING_CHECKOUT,
    component: () => import('@/views/onboarding/CheckoutAssinaturaView.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: true,
      businessOnly: true,
      skipNegocioGuard: true,
      title: 'Checkout',
    },
  },
]
