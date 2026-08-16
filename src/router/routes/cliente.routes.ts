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
      layout: 'agendar-publico',
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
    path: `${ROUTE_PATHS.AVALIAR_ATENDIMENTO}/:token`,
    name: ROUTE_NAMES.AVALIAR_ATENDIMENTO,
    component: () => import('@/views/dashboard/cliente/AvaliarAtendimentoView.vue'),
    props: { mode: 'token' },
    meta: {
      layout: 'public',
      skipNegocioGuard: true,
      title: 'Avaliar atendimento',
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
    path: `${ROUTE_PATHS.MEUS_AGENDAMENTOS_DETALHE}/:id/avaliar`,
    name: ROUTE_NAMES.AGENDAMENTO_AVALIAR,
    component: () => import('@/views/dashboard/cliente/AvaliarAtendimentoView.vue'),
    props: { mode: 'agendamento' },
    meta: {
      layout: 'dashboard',
      requiresAuth: true,
      clienteOnly: true,
      title: 'Avaliar atendimento',
    },
  },
  {
    path: `${ROUTE_PATHS.CONVITES}/:token`,
    name: ROUTE_NAMES.CONVITE_RESPONDER,
    redirect: (to) => {
      const raw = to.params.token
      const token = Array.isArray(raw) ? raw[0] : raw
      if (!token) return { path: ROUTE_PATHS.DASHBOARD }
      const base = (import.meta.env.VITE_LANDING_URL?.trim() || 'https://glowupconnect.com.br').replace(/\/+$/, '')
      window.location.replace(`${base}/convite/${encodeURIComponent(String(token))}`)
      return { path: ROUTE_PATHS.DASHBOARD }
    },
    meta: {
      layout: 'public',
      title: 'Responder convite',
    },
  },
  {
    path: `/convite/:token`,
    name: 'convite-landing-redirect',
    redirect: (to) => {
      const raw = to.params.token
      const token = Array.isArray(raw) ? raw[0] : raw
      if (!token) return { path: ROUTE_PATHS.DASHBOARD }
      const base = (import.meta.env.VITE_LANDING_URL?.trim() || 'https://glowupconnect.com.br').replace(/\/+$/, '')
      window.location.replace(`${base}/convite/${encodeURIComponent(String(token))}`)
      return { path: ROUTE_PATHS.DASHBOARD }
    },
    meta: {
      layout: 'public',
      title: 'Convite',
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
