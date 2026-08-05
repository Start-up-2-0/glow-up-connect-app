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
  /** Badge/indicador exibido no item (ex.: 'Novo', contador). */
  badge?: string
}

export interface NavItem extends NavGateMeta {
  id: string
  label: string
  to?: string
  icon?: NavIconName
  badge?: string
  children?: NavChildItem[]
}

/** Agrupamento visual da sidebar — ex.: Agenda, Loja, Financeiro, Conta */
export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 272
export const SIDEBAR_WIDTH_COLLAPSED = 99

const financeiroNavChildren: NavChildItem[] = [
  {
    id: 'financeiro-resumo',
    label: 'Visão geral',
    to: ROUTE_PATHS.FINANCEIRO,
    icon: 'dashboard',
    requerModulo: 'Financeiro',
    requerPermissao: 'CaixaVisualizar',
  },
  {
    id: 'financeiro-comissoes',
    label: 'Comissões',
    to: ROUTE_PATHS.FINANCEIRO_COMISSOES,
    icon: 'finance',
    requerModulo: 'ComissaoProfissionais',
    requerPermissao: 'CaixaVisualizar',
  },
]

const lojaNavItems: NavItem[] = [
  {
    id: 'perfil-estabelecimento',
    label: 'Dados da loja',
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
    label: 'Horários',
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
]

function childToNavItem(child: NavChildItem): NavItem {
  return {
    id: child.id,
    label: child.label,
    to: child.to,
    icon: child.icon,
    requerModulo: child.requerModulo,
    requerModulos: child.requerModulos,
    requerSemModulo: child.requerSemModulo,
    requerPermissao: child.requerPermissao,
    requerPermissoes: child.requerPermissoes,
    requerAssinatura: child.requerAssinatura,
  }
}

/** Menu operacional — roles de negócio (não Cliente), agrupado por seção */
export const businessNavSections: NavSection[] = [
  {
    id: 'sec-principal',
    label: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: ROUTE_PATHS.DASHBOARD,
        icon: 'dashboard',
        requerAssinatura: false,
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
        badge: 'Novo',
        requerModulo: 'Clientes',
        requerPermissao: 'ClienteVisualizarGeral',
      },
      lojaNavItems.find((item) => item.id === 'servicos')!,
      lojaNavItems.find((item) => item.id === 'profissionais-vitrine')!,
    ],
  },
  {
    id: 'sec-financeiro',
    label: 'Financeiro',
    items: [
      ...financeiroNavChildren.map(childToNavItem),
      lojaNavItems.find((item) => item.id === 'assinatura')!,
      {
        id: 'faturas',
        label: 'Faturas',
        to: ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS,
        icon: 'subscription',
        requerModulo: 'Assinatura',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
    ],
  },
  {
    id: 'sec-configuracoes',
    label: 'Configurações',
    items: [
      lojaNavItems.find((item) => item.id === 'perfil-estabelecimento')!,
      lojaNavItems.find((item) => item.id === 'equipe')!,
      lojaNavItems.find((item) => item.id === 'horarios')!,
      lojaNavItems.find((item) => item.id === 'whatsapp')!,
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

/** @deprecated Lista plana derivada das seções — compatibilidade */
export const businessNavItems: NavItem[] = businessNavSections.flatMap((section) => section.items)

const financeiroNavItem: NavItem = {
  id: 'financeiro',
  label: 'Financeiro',
  icon: 'finance',
  requerModulos: ['Caixa', 'Financeiro'],
  requerPermissao: 'CaixaVisualizar',
  children: financeiroNavChildren,
}

/** Menu do cliente final — ver docs/acesso/cliente.md */
export const clienteNavSections: NavSection[] = [
  {
    id: 'sec-agenda',
    label: 'Agenda',
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
    id: 'sec-conta',
    label: 'Conta',
    items: [
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

export const clienteNavItems: NavItem[] = clienteNavSections.flatMap((section) => section.items)

/** Menu operacional exclusivo da role Profissional na loja */
export const profissionalNavSections: NavSection[] = [
  {
    id: 'sec-agenda',
    label: 'Agenda',
    items: [
      {
        id: 'meu-trabalho',
        label: 'Meu trabalho',
        icon: 'calendar',
        children: [
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
    ],
  },
]

export const profissionalNavItems: NavItem[] = profissionalNavSections.flatMap((section) => section.items)

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

// Referência para docs legados
export { financeiroNavItem }
