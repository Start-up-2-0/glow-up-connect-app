import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

const placeholder = () => import('@/views/dashboard/placeholders/ModuloPlaceholderView.vue')

export const modulosRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.AGENDA,
    name: ROUTE_NAMES.AGENDA,
    component: placeholder,
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Agenda',
      requerPermissoes: ['AgendaVisualizarGeral', 'AgendaVisualizarPropria'],
      title: 'Agenda',
    },
  },
  {
    path: ROUTE_PATHS.SERVICOS,
    name: ROUTE_NAMES.SERVICOS,
    component: placeholder,
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Servicos',
      title: 'Serviços',
    },
  },
  {
    path: ROUTE_PATHS.FINANCEIRO,
    name: ROUTE_NAMES.FINANCEIRO,
    component: placeholder,
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulos: ['Caixa', 'Financeiro'],
      requerPermissao: 'CaixaVisualizar',
      title: 'Financeiro',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_EQUIPE,
    name: ROUTE_NAMES.CONFIG_EQUIPE,
    component: placeholder,
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'Profissionais',
      requerPermissao: 'EquipeGerenciar',
      title: 'Equipe',
    },
  },
  {
    path: ROUTE_PATHS.CONFIG_WHATSAPP,
    name: ROUTE_NAMES.CONFIG_WHATSAPP,
    component: placeholder,
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      businessOnly: true,
      requerModulo: 'WhatsApp',
      title: 'WhatsApp',
    },
  },
]
