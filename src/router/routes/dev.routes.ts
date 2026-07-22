import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const devRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: ROUTE_PATHS.DEV_SERVICOS_FIGMA,
        name: ROUTE_NAMES.DEV_SERVICOS_FIGMA,
        component: () => import('@/views/dev/ServicosFigmaPreviewView.vue'),
        meta: {
          layout: 'dev-preview',
          devPreview: true,
          skipNegocioGuard: true,
          title: 'Dev — Serviços Figma',
        },
      },
      {
        path: ROUTE_PATHS.DEV_EQUIPE_FIGMA,
        name: ROUTE_NAMES.DEV_EQUIPE_FIGMA,
        component: () => import('@/views/dev/EquipeFigmaPreviewView.vue'),
        meta: {
          layout: 'dev-preview',
          devPreview: true,
          skipNegocioGuard: true,
          title: 'Dev — Equipe Figma',
        },
      },
    ]
  : []
