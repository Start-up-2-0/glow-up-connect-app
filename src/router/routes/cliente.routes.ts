import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const clienteRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.EXPLORAR,
    name: ROUTE_NAMES.EXPLORAR,
    component: () => import('@/views/dashboard/cliente/ExplorarView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Explorar lojas',
    },
  },
  {
    path: `${ROUTE_PATHS.LOJA}/:publicGuid`,
    name: ROUTE_NAMES.LOJA_DETALHE,
    component: () => import('@/views/dashboard/cliente/LojaDetalheView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Detalhe da loja',
    },
  },
  {
    path: `${ROUTE_PATHS.LOJA}/:publicGuid/agendar`,
    name: ROUTE_NAMES.LOJA_AGENDAR,
    component: () => import('@/views/dashboard/cliente/AgendarWizardView.vue'),
    meta: {
      layout: 'public',
      skipNegocioGuard: true,
      title: 'Agendar',
    },
  },
  {
    path: `${ROUTE_PATHS.AGENDAMENTO_REMARCACAO}/:token`,
    name: ROUTE_NAMES.AGENDAMENTO_REMARCACAO,
    component: () => import('@/views/dashboard/cliente/RemarcacaoResponderView.vue'),
    meta: {
      layout: 'public',
      skipNegocioGuard: true,
      title: 'Responder reagendamento',
    },
  },
  {
    path: ROUTE_PATHS.MEUS_AGENDAMENTOS,
    name: ROUTE_NAMES.MEUS_AGENDAMENTOS,
    component: () => import('@/views/dashboard/cliente/MeusAgendamentosView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Meus agendamentos',
    },
  },
  {
    path: `${ROUTE_PATHS.MEUS_AGENDAMENTOS_DETALHE}/:id`,
    name: ROUTE_NAMES.AGENDAMENTO_DETALHE,
    component: () => import('@/views/dashboard/cliente/AgendamentoDetalheView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Detalhe do agendamento',
    },
  },
  {
    path: ROUTE_PATHS.CONVITES,
    name: ROUTE_NAMES.CONVITES,
    component: () => import('@/views/dashboard/cliente/ConvitesView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Convites',
    },
  },
  {
    path: `${ROUTE_PATHS.CONVITES}/:token`,
    name: ROUTE_NAMES.CONVITE_RESPONDER,
    component: () => import('@/views/dashboard/cliente/ConviteResponderView.vue'),
    meta: {
      layout: 'public',
      title: 'Responder convite',
    },
  },
  {
    path: ROUTE_PATHS.PERFIL,
    name: ROUTE_NAMES.PERFIL,
    component: () => import('@/views/dashboard/cliente/PerfilView.vue'),
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Meu perfil',
    },
  },
]
