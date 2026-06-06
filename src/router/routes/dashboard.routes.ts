import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    name: ROUTE_NAMES.DASHBOARD_HOME,
    component: () => import('@/views/dashboard/DashboardEntryView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, title: 'Dashboard' },
  },
]
