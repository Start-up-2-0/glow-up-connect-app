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

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 272
export const SIDEBAR_WIDTH_COLLAPSED = 99

/** Menu do cliente final — agrupado para reduzir poluição visual */
export const clienteNavSections: NavSection[] = [
  {
    id: 'cliente-agenda',
    label: 'Agendar e explorar',
    items: [
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
    items: [
      {
        id: 'convites',
        label: 'Convites',
        to: ROUTE_PATHS.CONVITES,
        icon: 'invites',
      },
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
    {
      id: 'financeiro-rede',
      label: 'Painel da rede',
      to: ROUTE_PATHS.FINANCEIRO_REDE,
      requerModulo: 'Financeiro',
      requerPermissao: 'CaixaVisualizar',
    },
  ],
}

/** Menu operacional do negócio — seções recolhíveis */
export const businessNavSections: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Visão geral',
        to: ROUTE_PATHS.DASHBOARD,
        icon: 'dashboard',
        requerAssinatura: false,
      },
    ],
  },
  {
    id: 'minha-loja',
    label: 'Minha loja',
    items: [
      {
        id: 'perfil-estabelecimento',
        label: 'Dados do estabelecimento',
        to: ROUTE_PATHS.CONFIG_PERFIL,
        icon: 'building',
        requerModulo: 'Estabelecimento',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
      {
        id: 'profissionais-vitrine',
        label: 'Profissionais',
        to: ROUTE_PATHS.CONFIG_PROFISSIONAIS_VITRINE,
        icon: 'team',
        requerModulo: 'HorariosAtendimento',
        requerSemModulo: 'Profissionais',
        requerPermissao: 'ProfissionalGerenciar',
      },
      {
        id: 'equipe',
        label: 'Equipe',
        to: ROUTE_PATHS.CONFIG_EQUIPE,
        icon: 'team',
        requerModulo: 'Profissionais',
        requerPermissao: 'EquipeGerenciar',
      },
      {
        id: 'servicos',
        label: 'Serviços',
        to: ROUTE_PATHS.SERVICOS,
        icon: 'services',
        requerModulo: 'Servicos',
        requerPermissoes: ['ServicoVisualizar', 'ServicoGerenciar'],
      },
      {
        id: 'horarios',
        label: 'Horários de atendimento',
        to: ROUTE_PATHS.CONFIG_HORARIOS,
        icon: 'clock',
        requerModulo: 'HorariosAtendimento',
        requerPermissao: 'HorarioGerenciar',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        to: ROUTE_PATHS.CONFIG_WHATSAPP,
        icon: 'whatsapp',
        requerModulo: 'WhatsApp',
        requerPermissao: 'NegocioEditar',
      },
      {
        id: 'assinatura',
        label: 'Planos e assinatura',
        to: ROUTE_PATHS.CONFIG_ASSINATURA,
        icon: 'subscription',
        requerModulo: 'Assinatura',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
    ],
  },
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    items: [
      {
        id: 'agenda',
        label: 'Agenda',
        to: ROUTE_PATHS.AGENDA,
        icon: 'calendar',
        requerModulo: 'Agenda',
        requerPermissoes: ['AgendaVisualizarGeral', 'AgendaVisualizarPropria'],
      },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      {
        id: 'clientes',
        label: 'Clientes cadastrados',
        to: ROUTE_PATHS.CONFIG_CLIENTES,
        icon: 'team',
        requerModulo: 'Clientes',
        requerPermissao: 'ClienteVisualizarGeral',
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    items: [financeiroNavItem],
  },
  {
    id: 'historico',
    label: 'Histórico e auditoria',
    items: [
      {
        id: 'auditoria',
        label: 'Auditoria',
        to: ROUTE_PATHS.CONFIG_AUDITORIA,
        icon: 'finance',
        requerModulo: 'Financeiro',
        requerPermissao: 'NegocioVisualizar',
      },
      {
        id: 'privacidade',
        label: 'Privacidade e dados',
        to: ROUTE_PATHS.CONFIG_PRIVACIDADE,
        icon: 'user',
        requerAssinatura: false,
      },
    ],
  },
]

/** Menu operacional exclusivo da role Profissional na loja */
export const profissionalNavSections: NavSection[] = [
  {
    id: 'meu-trabalho',
    label: 'Meu trabalho',
    items: [
      {
        id: 'agenda',
        label: 'Minha agenda',
        to: ROUTE_PATHS.AGENDA,
        icon: 'calendar',
        requerModulo: 'Agenda',
        requerPermissao: 'AgendaVisualizarPropria',
      },
      {
        id: 'meus-horarios',
        label: 'Meus horários',
        to: ROUTE_PATHS.CONFIG_HORARIOS,
        icon: 'clock',
        requerModulo: 'HorariosAtendimento',
        requerPermissao: 'HorarioGerenciarProprio',
      },
      {
        id: 'meus-servicos',
        label: 'Meus serviços',
        to: ROUTE_PATHS.SERVICOS,
        icon: 'services',
        requerModulo: 'Servicos',
        requerPermissao: 'ServicoVisualizar',
      },
    ],
  },
]

/** @deprecated Use businessNavSections */
export const businessNavItems: NavItem[] = businessNavSections.flatMap((section) => section.items)

/** @deprecated Use clienteNavSections */
export const clienteNavItems: NavItem[] = clienteNavSections.flatMap((section) => section.items)

/** @deprecated Use profissionalNavSections */
export const profissionalNavItems: NavItem[] = profissionalNavSections.flatMap((section) => section.items)

export const NAV_SEARCH_PLACEHOLDER_PROFISSIONAL = 'Agenda, horários, serviços...'

export const NAV_SEARCH_PLACEHOLDER_BUSINESS =
  'Agenda, serviços, equipe, financeiro...'

export const NAV_SEARCH_PLACEHOLDER_CLIENTE =
  'Explorar lojas, agendamentos, perfil...'

/** @deprecated Use getNavSearchPlaceholder(role) */
export const NAV_SEARCH_PLACEHOLDER = NAV_SEARCH_PLACEHOLDER_BUSINESS

export function flattenNavSections(sections: NavSection[]): NavItem[] {
  return sections.flatMap((section) => section.items)
}

export function getNavItemsForRole(role: UserRole | string | number | undefined): NavItem[] {
  return flattenNavSections(isClienteRole(role) ? clienteNavSections : businessNavSections)
}

export function getNavSearchPlaceholder(role: UserRole | string | number | undefined): string {
  return isClienteRole(role) ? NAV_SEARCH_PLACEHOLDER_CLIENTE : NAV_SEARCH_PLACEHOLDER_BUSINESS
}
