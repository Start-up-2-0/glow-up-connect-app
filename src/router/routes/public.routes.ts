import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.HOME,
    name: ROUTE_NAMES.LANDING,
    component: () => import('@/views/public/LandingView.vue'),
    meta: { layout: 'landing', skipNegocioGuard: true, title: 'Início' },
  },
  {
    path: ROUTE_PATHS.ONBOARDING_PLANOS,
    redirect: { path: ROUTE_PATHS.HOME, hash: '#planos' },
  },
]
