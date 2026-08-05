import type { Component } from 'vue'
import {
  Bell,
  Building2,
  CalendarDays,
  Circle,
  Clock,
  Compass,
  CreditCard,
  FileText,
  House,
  LayoutDashboard,
  MessageCircle,
  Percent,
  Scissors,
  Shield,
  Store,
  Target,
  User,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-vue-next'

/**
 * Mapeia o id do item / nome de ícone (de `resolveNavIcon`) para um
 * componente Lucide. Mantém consistência de tamanho/peso em toda a sidebar.
 */
const ICON_MAP: Record<string, Component> = {
  // Início / visão geral
  dashboard: LayoutDashboard,
  'financeiro-resumo': LayoutDashboard,
  inicio: House,
  home: House,
  // Agendamentos
  agenda: CalendarDays,
  'meus-agendamentos': CalendarDays,
  'meu-trabalho': CalendarDays,
  'novo-agendamento': CalendarDays,
  explorar: Compass,
  explore: Compass,
  convites: UserPlus,
  clientes: Users,
  team: Users,
  // Gestão
  servicos: Scissors,
  'meus-servicos': Scissors,
  services: Scissors,
  horarios: Clock,
  'meus-horarios': Clock,
  equipe: Users,
  'profissionais-vitrine': Users,
  whatsapp: MessageCircle,
  // Financeiro
  financeiro: Wallet,
  'financeiro-comissoes': Percent,
  'financeiro-metas': Target,
  finance: Wallet,
  target: Target,
  // Loja / conta
  'perfil-estabelecimento': Building2,
  building: Building2,
  'minha-loja': Store,
  'abrir-loja': Store,
  store: Store,
  assinatura: CreditCard,
  subscription: CreditCard,
  auditoria: FileText,
  privacidade: Shield,
  perfil: User,
  user: User,
  // Comunicação
  mensagens: Bell,
  notificacoes: Bell,
}

export const FALLBACK_ICON: Component = Circle

export function resolveSidebarIcon(id: string, explicit?: string): Component {
  const key = explicit ?? id
  return ICON_MAP[key] ?? ICON_MAP[id] ?? FALLBACK_ICON
}
