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
  /** Ocultar para profissional autônomo (equipe, comissões, multi-loja). */
  ocultarParaAutonomo?: boolean
  /** Exclusivo do proprietário (Owner) no estabelecimento ativo. */
  requerRoleOwner?: boolean
  /** Plano com multi-unidade (limite de estabelecimentos > 1). */
  requerMultiLoja?: boolean
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

/** Agrupamento visual da sidebar — Gestão, Financeiro, Configurações, etc. */
export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

export const SIDEBAR_WIDTH_EXPANDED = 280
export const SIDEBAR_WIDTH_COLLAPSED = 72

const financeiroNavChildren: NavChildItem[] = [
  {
    id: 'financeiro-resumo',
    label: 'Dashboard',
    to: ROUTE_PATHS.FINANCEIRO,
    icon: 'finance',
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
    ocultarParaAutonomo: true,
  },
]

const financeiroNavItem: NavItem = {
  id: 'financeiro',
  label: 'Financeiro',
  icon: 'finance',
  requerModulos: ['Caixa', 'Financeiro'],
  requerPermissao: 'CaixaVisualizar',
  children: financeiroNavChildren,
}

const assinaturaNavChildren: NavChildItem[] = [
  {
    id: 'assinatura-plano',
    label: 'Plano',
    to: ROUTE_PATHS.CONFIG_ASSINATURA,
    icon: 'subscription',
    requerModulo: 'Assinatura',
    requerPermissao: 'NegocioEditar',
    requerAssinatura: false,
  },
  {
    id: 'assinatura-faturas',
    label: 'Faturas',
    to: ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS,
    icon: 'subscription',
    requerModulo: 'Assinatura',
    requerPermissao: 'NegocioEditar',
    requerAssinatura: false,
  },
]

const assinaturaNavItem: NavItem = {
  id: 'assinatura',
  label: 'Assinatura',
  icon: 'subscription',
  requerModulo: 'Assinatura',
  requerPermissao: 'NegocioEditar',
  requerAssinatura: false,
  children: assinaturaNavChildren,
}

/** Menu operacional — loja / negócio */
export const businessNavSections: NavSection[] = [
  {
    id: 'sec-gestao',
    label: 'Gestão',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: ROUTE_PATHS.DASHBOARD,
        icon: 'dashboard',
        requerAssinatura: false,
      },
      {
        id: 'minhas-lojas',
        label: 'Minhas Lojas',
        to: ROUTE_PATHS.MINHAS_LOJAS,
        icon: 'building',
        requerRoleOwner: true,
        requerMultiLoja: true,
        ocultarParaAutonomo: true,
        requerAssinatura: true,
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
      {
        id: 'profissionais-vitrine',
        label: 'Profissionais',
        to: ROUTE_PATHS.CONFIG_PROFISSIONAIS_VITRINE,
        icon: 'team',
        requerModulo: 'HorariosAtendimento',
        requerSemModulo: 'Profissionais',
        requerPermissao: 'ProfissionalGerenciar',
        ocultarParaAutonomo: true,
      },
      {
        id: 'servicos',
        label: 'Serviços',
        to: ROUTE_PATHS.SERVICOS,
        icon: 'services',
        requerModulo: 'Servicos',
        requerPermissoes: ['ServicoVisualizar', 'ServicoGerenciar'],
      },
    ],
  },
  {
    id: 'sec-financeiro',
    label: 'Financeiro',
    items: [
      financeiroNavItem,
      assinaturaNavItem,
    ],
  },
  {
    id: 'sec-configuracoes',
    label: 'Configurações',
    items: [
      {
        id: 'perfil',
        label: 'Perfil',
        to: ROUTE_PATHS.PERFIL,
        icon: 'user',
        requerAssinatura: false,
      },
      {
        id: 'perfil-estabelecimento',
        label: 'Minha loja',
        to: ROUTE_PATHS.CONFIG_PERFIL,
        icon: 'building',
        requerModulo: 'Estabelecimento',
        requerPermissao: 'NegocioEditar',
        requerAssinatura: false,
      },
      {
        id: 'equipe',
        label: 'Equipe',
        to: ROUTE_PATHS.CONFIG_EQUIPE,
        icon: 'team',
        requerModulo: 'Profissionais',
        requerPermissao: 'EquipeGerenciar',
        ocultarParaAutonomo: true,
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
        label: 'Integrações',
        to: ROUTE_PATHS.CONFIG_WHATSAPP,
        icon: 'whatsapp',
        badge: 'Beta',
        requerModulo: 'WhatsApp',
        requerPermissao: 'NegocioEditar',
      },
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
        label: 'Preferências',
        to: ROUTE_PATHS.CONFIG_PRIVACIDADE,
        icon: 'user',
        requerAssinatura: false,
      },
    ],
  },
]

/** @deprecated Lista plana derivada das seções — compatibilidade */
export const businessNavItems: NavItem[] = businessNavSections.flatMap((section) => section.items)

/** Menu do cliente final */
export const clienteNavSections: NavSection[] = [
  {
    id: 'sec-explorar',
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
    id: 'sec-conta',
    label: 'Conta',
    items: [
      {
        id: 'perfil',
        label: 'Perfil',
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
    id: 'sec-trabalho',
    label: 'Trabalho',
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

export const profissionalNavItems: NavItem[] = profissionalNavSections.flatMap((section) => section.items)

export const NAV_SEARCH_PLACEHOLDER_PROFISSIONAL = 'Buscar agenda, horários, serviços…'

export const NAV_SEARCH_PLACEHOLDER_BUSINESS =
  'Buscar agenda, clientes, serviços, financeiro…'

export const NAV_SEARCH_PLACEHOLDER_CLIENTE =
  'Buscar lojas, agendamentos, perfil…'

/** @deprecated Use getNavSearchPlaceholder(role) */
export const NAV_SEARCH_PLACEHOLDER = NAV_SEARCH_PLACEHOLDER_BUSINESS

export function getNavItemsForRole(role: UserRole | string | number | undefined): NavItem[] {
  return isClienteRole(role) ? clienteNavItems : businessNavItems
}

export function getNavSearchPlaceholder(role: UserRole | string | number | undefined): string {
  return isClienteRole(role) ? NAV_SEARCH_PLACEHOLDER_CLIENTE : NAV_SEARCH_PLACEHOLDER_BUSINESS
}

export { financeiroNavItem }
