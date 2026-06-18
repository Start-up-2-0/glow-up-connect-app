import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth.store'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.HOME,
    name: ROUTE_NAMES.HOME_REDIRECT,
    redirect: () => {
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.LOGIN
    },
  },
  {
    path: ROUTE_PATHS.CONFIRM_WHATSAPP,
    name: ROUTE_NAMES.CONFIRM_WHATSAPP,
    component: () => import('@/views/public/ConfirmarWhatsappView.vue'),
    meta: { layout: 'public', skipNegocioGuard: true, title: 'Confirmar WhatsApp' },
  },
  {
    path: `${ROUTE_PATHS.CONFIRM_WHATSAPP_LEGACY}/:token`,
    redirect: (to) => `/c/${String(to.params.token ?? '')}`,
  },
]
