import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'

export const notFoundRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.NOT_FOUND,
    component: () => import('@/views/NotFoundView.vue'),
    meta: { layout: 'auth', title: 'Página não encontrada' },
  },
]
