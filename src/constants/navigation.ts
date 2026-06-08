import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole, type UserRole } from '@/types/user.types'

export interface NavGateMeta {
  requerModulo?: string
  requerModulos?: string[]
  requerPermissao?: string
  requerPermissoes?: string[]
  /** Default true para itens com gate de módulo */
  requerAssinatura?: boolean
}

export interface NavChildItem extends NavGateMeta {
  id: string
  label: string
  to?: string
}

export interface NavItem extends NavGateMeta {
  id: string
  label: string
  to?: string
  children?: NavChildItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 272
export const SIDEBAR_WIDTH_COLLAPSED = 99

/** Menu operacional — roles de negócio (não Cliente). */
export const businessNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: ROUTE_PATHS.DASHBOARD,
    requerAssinatura: false,
  },
  {
    id: 'agenda',
    label: 'Agenda',
    to: ROUTE_PATHS.AGENDA,
    requerModulo: 'Agenda',
    requerPermissoes: ['AgendaVisualizarGeral', 'AgendaVisualizarPropria'],
  },
  {
    id: 'servicos',
    label: 'Serviços',
    to: ROUTE_PATHS.SERVICOS,
    requerModulo: 'Servicos',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
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
        id: 'financeiro-caixa',
        label: 'Caixa',
        to: ROUTE_PATHS.FINANCEIRO_CAIXA,
        requerModulo: 'Caixa',
        requerPermissao: 'CaixaVisualizar',
      },
      {
        id: 'financeiro-comissoes',
        label: 'Comissões',
        to: ROUTE_PATHS.FINANCEIRO_COMISSOES,
        requerModulo: 'ComissaoProfissionais',
        requerPermissao: 'CaixaVisualizar',
      },
      {
        id: 'financeiro-relatorios',
        label: 'Relatórios',
        to: ROUTE_PATHS.FINANCEIRO_RELATORIOS,
        requerModulo: 'Financeiro',
        requerPermissao: 'CaixaVisualizar',
      },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    children: [
      {
        id: 'config-perfil',
        label: 'Perfil',
        to: ROUTE_PATHS.CONFIG_PERFIL,
        requerModulo: 'Estabelecimento',
        requerAssinatura: false,
      },
      {
        id: 'config-horarios',
        label: 'Horários',
        to: ROUTE_PATHS.CONFIG_HORARIOS,
        requerModulo: 'HorariosAtendimento',
      },
      {
        id: 'config-assinatura',
        label: 'Assinatura',
        to: ROUTE_PATHS.CONFIG_ASSINATURA,
        requerModulo: 'Assinatura',
        requerAssinatura: false,
      },
      {
        id: 'config-equipe',
        label: 'Equipe',
        to: ROUTE_PATHS.CONFIG_EQUIPE,
        requerModulo: 'Profissionais',
        requerPermissao: 'EquipeGerenciar',
      },
      {
        id: 'config-whatsapp',
        label: 'WhatsApp',
        to: ROUTE_PATHS.CONFIG_WHATSAPP,
        requerModulo: 'WhatsApp',
      },
    ],
  },
]

/** Menu do cliente final — ver docs/acesso/cliente.md */
export const clienteNavItems: NavItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    to: ROUTE_PATHS.DASHBOARD,
  },
  {
    id: 'explorar',
    label: 'Explorar lojas',
    to: ROUTE_PATHS.EXPLORAR,
  },
  {
    id: 'meus-agendamentos',
    label: 'Meus agendamentos',
    to: ROUTE_PATHS.MEUS_AGENDAMENTOS,
  },
  {
    id: 'convites',
    label: 'Convites',
    to: ROUTE_PATHS.CONVITES,
  },
  {
    id: 'perfil',
    label: 'Meu perfil',
    to: ROUTE_PATHS.PERFIL,
  },
  {
    id: 'abrir-loja',
    label: 'Abrir minha loja',
    to: ROUTE_PATHS.ONBOARDING_PLANOS,
  },
]

export const NAV_SEARCH_PLACEHOLDER_BUSINESS =
  'Dashboard, agenda, serviços, assinatura...'

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
