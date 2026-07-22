import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole, type UserRole } from '@/types/user.types'
import type { NavIconName } from '@/types/navIcon.types'

export interface NavGateMeta {
  requerModulo?: string
  requerModulos?: string[]
  /** Exibir apenas quando o estabelecimento não possui este módulo */
  requerSemModulo?: string
  requerPermissao?: string
  requerPermissoes?: string[]
  /** Default true para itens com gate de módulo */
  requerAssinatura?: boolean
}

export interface NavChildItem extends NavGateMeta {
  id: string
  label: string
  to?: string
  icon?: NavIconName
}

export interface NavItem extends NavGateMeta {
  id: string
  label: string
  to?: string
  icon?: NavIconName
  children?: NavChildItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 272
export const SIDEBAR_WIDTH_COLLAPSED = 99

const financeiroNavItem: NavItem = {
  id: 'financeiro',
  label: 'Financeiro',
  icon: 'finance',
  requerModulos: ['Caixa', 'Financeiro'],
  requerPermissao: 'CaixaVisualizar',
  children: [
    {
      id: 'financeiro-resumo',
      label: 'Visão geral',
      to: ROUTE_PATHS.FINANCEIRO,
      requerModulo: 'Financeiro',
      requerPermissao: 'CaixaVisualizar',
    },
    {
      id: 'financeiro-entradas',
      label: 'Entradas',
      to: ROUTE_PATHS.FINANCEIRO_ENTRADAS,
      requerModulo: 'Financeiro',
      requerPermissao: 'CaixaVisualizar',
    },
    {
      id: 'financeiro-saidas',
      label: 'Saídas',
      to: ROUTE_PATHS.FINANCEIRO_SAIDAS,
      requerModulo: 'Financeiro',
      requerPermissao: 'CaixaVisualizar',
    },
    {
      id: 'financeiro-comissoes',
      label: 'Comissões',
      to: ROUTE_PATHS.FINANCEIRO_COMISSOES,
      requerModulo: 'ComissaoProfissionais',
      requerPermissao: 'CaixaVisualizar',
    },
  ],
}

/** Menu do cliente final — ver docs/acesso/cliente.md */
export const clienteNavItems: NavItem[] = [
  {
    id: 'cliente-agenda',
    label: 'Agendar e explorar',
    icon: 'explore',
    children: [
      {
        id: 'inicio',
        label: 'Início',
        to: ROUTE_PATHS.DASHBOARD,
        icon: 'home',
      },
      {
        id: 'explorar',
        label: 'Explorar lojas',
        to: ROUTE_PATHS.EXPLORAR,
        icon: 'explore',
      },
      {
        id: 'meus-agendamentos',
        label: 'Meus agendamentos',
        to: ROUTE_PATHS.MEUS_AGENDAMENTOS,
        icon: 'calendar',
      },
    ],
  },
  {
    id: 'cliente-conta',
    label: 'Minha conta',
    icon: 'user',
    children: [
      {
        id: 'perfil',
        label: 'Meu perfil',
        to: ROUTE_PATHS.PERFIL,
        icon: 'user',
      },
      {
        id: 'abrir-loja',
        label: 'Abrir minha loja',
        to: ROUTE_PATHS.ONBOARDING_PLANOS,
        icon: 'store-open',
      },
    ],
  },
]

/** Menu operacional — roles de negócio (não Cliente). */
export const businessNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: ROUTE_PATHS.DASHBOARD,
    icon: 'dashboard',
    requerAssinatura: false,
  },
  {
    id: 'minha-loja',
    label: 'Minha loja',
    icon: 'building',
    children: [
      {
        id: 'perfil-estabelecimento',
        label: 'Dados do estabelecimento',
        to: ROUTE_PATHS.CONFIG_PERFIL,
        requerModulo: 'Estabelecimento',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
      {
        id: 'profissionais-vitrine',
        label: 'Profissionais',
        to: ROUTE_PATHS.CONFIG_PROFISSIONAIS_VITRINE,
        requerModulo: 'HorariosAtendimento',
        requerSemModulo: 'Profissionais',
        requerPermissao: 'ProfissionalGerenciar',
      },
      {
        id: 'equipe',
        label: 'Equipe',
        to: ROUTE_PATHS.CONFIG_EQUIPE,
        requerModulo: 'Profissionais',
        requerPermissao: 'EquipeGerenciar',
      },
      {
        id: 'servicos',
        label: 'Serviços',
        to: ROUTE_PATHS.SERVICOS,
        requerModulo: 'Servicos',
        requerPermissoes: ['ServicoVisualizar', 'ServicoGerenciar'],
      },
      {
        id: 'horarios',
        label: 'Horários de atendimento',
        to: ROUTE_PATHS.CONFIG_HORARIOS,
        requerModulo: 'HorariosAtendimento',
        requerPermissao: 'HorarioGerenciar',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        to: ROUTE_PATHS.CONFIG_WHATSAPP,
        requerModulo: 'WhatsApp',
        requerPermissao: 'NegocioEditar',
      },
      {
        id: 'assinatura',
        label: 'Planos e assinatura',
        to: ROUTE_PATHS.CONFIG_ASSINATURA,
        requerModulo: 'Assinatura',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    to: ROUTE_PATHS.AGENDA,
    icon: 'calendar',
    requerModulo: 'Agenda',
    requerPermissoes: ['AgendaVisualizarGeral', 'AgendaVisualizarPropria'],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    to: ROUTE_PATHS.CONFIG_CLIENTES,
    icon: 'team',
    requerModulo: 'Clientes',
    requerPermissao: 'ClienteVisualizarGeral',
  },
  financeiroNavItem,
  {
    id: 'historico',
    label: 'Histórico e auditoria',
    icon: 'user',
    children: [
      {
        id: 'auditoria',
        label: 'Auditoria',
        to: ROUTE_PATHS.CONFIG_AUDITORIA,
        requerModulo: 'Financeiro',
        requerPermissao: 'NegocioVisualizar',
      },
      {
        id: 'privacidade',
        label: 'Privacidade e dados',
        to: ROUTE_PATHS.CONFIG_PRIVACIDADE,
        requerAssinatura: false,
      },
    ],
  },
]

/** Menu operacional exclusivo da role Profissional na loja (sem gestão/financeiro). */
export const profissionalNavItems: NavItem[] = [
  {
    id: 'meu-trabalho',
    label: 'Meu trabalho',
    icon: 'calendar',
    children: [
      {
        id: 'agenda',
        label: 'Minha agenda',
        to: ROUTE_PATHS.AGENDA,
        requerModulo: 'Agenda',
        requerPermissao: 'AgendaVisualizarPropria',
      },
      {
        id: 'meus-horarios',
        label: 'Meus horários',
        to: ROUTE_PATHS.CONFIG_HORARIOS,
        requerModulo: 'HorariosAtendimento',
        requerPermissao: 'HorarioGerenciarProprio',
      },
      {
        id: 'meus-servicos',
        label: 'Meus serviços',
        to: ROUTE_PATHS.SERVICOS,
        requerModulo: 'Servicos',
        requerPermissao: 'ServicoVisualizar',
      },
    ],
  },
]

export const NAV_SEARCH_PLACEHOLDER_PROFISSIONAL = 'Agenda, horários, serviços...'

export const NAV_SEARCH_PLACEHOLDER_BUSINESS =
  'Agenda, serviços, equipe, financeiro...'

export const NAV_SEARCH_PLACEHOLDER_CLIENTE =
  'Explorar lojas, agendamentos, perfil...'

/** @deprecated Use getNavSearchPlaceholder(role) */
export const NAV_SEARCH_PLACEHOLDER = NAV_SEARCH_PLACEHOLDER_BUSINESS

export function getNavItemsForRole(role: UserRole | string | number | undefined): NavItem[] {
  return isClienteRole(role) ? clienteNavItems : businessNavItems
}

export function getNavSearchPlaceholder(role: UserRole | string | number | undefined): string {
  return isClienteRole(role) ? NAV_SEARCH_PLACEHOLDER_CLIENTE : NAV_SEARCH_PLACEHOLDER_BUSINESS
}
