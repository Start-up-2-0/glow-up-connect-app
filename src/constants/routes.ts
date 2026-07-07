export const ROUTE_NAMES = {
  LOGIN: 'login',
  REGISTER: 'register',
  CONFIRM_EMAIL: 'confirm-email',
  CONFIRM_EMAIL_CODE: 'confirm-email-code',
  CONFIRM_EMAIL_SUCCESS: 'confirm-email-success',
  FORGOT_PASSWORD: 'forgot-password',
  FORGOT_PASSWORD_CODE: 'forgot-password-code',
  RESET_PASSWORD: 'reset-password',
  RESET_PASSWORD_SUCCESS: 'reset-password-success',
  DASHBOARD_HOME: 'dashboard-home',
  EXPLORAR: 'explorar',
  MEUS_AGENDAMENTOS: 'meus-agendamentos',
  CONVITES: 'convites',
  CONVITE_RESPONDER: 'convite-responder',
  PERFIL: 'perfil',
  LOJA_DETALHE: 'loja-detalhe',
  LOJA_AGENDAR: 'loja-agendar',
  AGENDAMENTO_REMARCACAO: 'agendamento-remarcacao',
  AVALIAR_ATENDIMENTO: 'avaliar-atendimento',
  AGENDAMENTO_AVALIAR: 'agendamento-avaliar',
  AGENDAMENTO_DETALHE: 'agendamento-detalhe',
  NOT_FOUND: 'not-found',
  HOME_REDIRECT: 'home-redirect',
  CONFIRM_WHATSAPP: 'confirm-whatsapp',
  ONBOARDING_PLANOS: 'onboarding-planos',
  ONBOARDING_CONTRATAR: 'onboarding-contratar',
  ONBOARDING_CHECKOUT: 'onboarding-checkout',
  ONBOARDING_ASSINATURA: 'onboarding-assinatura',
  ASSINATURA_PAGAMENTO_SUCESSO: 'assinatura-pagamento-sucesso',
  ASSINATURA_PAGAMENTO_PENDENTE: 'assinatura-pagamento-pendente',
  ASSINATURA_PAGAMENTO_FALHA: 'assinatura-pagamento-falha',
  CONFIG_ASSINATURA: 'config-assinatura',
  CONFIG_ASSINATURA_FATURAS: 'config-assinatura-faturas',
  CONFIG_ASSINATURA_UPGRADE: 'config-assinatura-upgrade',
  UPGRADE: 'upgrade',
  AGENDA: 'agenda',
  SERVICOS: 'servicos',
  SERVICOS_NOVO: 'servicos-novo',
  SERVICOS_EDITAR: 'servicos-editar',
  SERVICOS_PROFISSIONAIS: 'servicos-profissionais',
  FINANCEIRO: 'financeiro',
  CONFIG_EQUIPE: 'config-equipe',
  CONFIG_WHATSAPP: 'config-whatsapp',
  CONFIG_HORARIOS: 'config-horarios',
  CONFIG_PERFIL: 'config-perfil',
  CONFIG_CLIENTES: 'config-clientes',
  AGENDA_SEMANA: 'agenda-semana',
  AGENDA_MES: 'agenda-mes',
  AGENDA_DETALHE: 'agenda-detalhe',
  CONFIG_EQUIPE_CONVITES: 'config-equipe-convites',
  CONFIG_EQUIPE_NOVO: 'config-equipe-novo',
  CONFIG_EQUIPE_USUARIO_NOVO: 'config-equipe-usuario-novo',
  CONFIG_PROFISSIONAIS_VITRINE: 'config-profissionais-vitrine',
  FINANCEIRO_CAIXA: 'financeiro-caixa',
  FINANCEIRO_MOVIMENTACOES: 'financeiro-movimentacoes',
  FINANCEIRO_CONTAS: 'financeiro-contas',
  FINANCEIRO_COMISSOES: 'financeiro-comissoes',
  FINANCEIRO_RELATORIOS: 'financeiro-relatorios',
  FINANCEIRO_CONCILIACAO: 'financeiro-conciliacao',
  FINANCEIRO_REDE: 'financeiro-rede',
  FINANCEIRO_MINHAS_COMISSOES: 'financeiro-minhas-comissoes',
  FINANCEIRO_CONTAS_RECEBER: 'financeiro-contas-receber',
  FINANCEIRO_CONTAS_PAGAR: 'financeiro-contas-pagar',
  CONFIG_AUDITORIA: 'config-auditoria',
  CONFIG_PRIVACIDADE: 'config-privacidade',
  TERMOS_DE_USO: 'termos-de-uso',
  POLITICA_COOKIES: 'politica-cookies',
  DEV_SERVICOS_FIGMA: 'dev-servicos-figma',
  DEV_EQUIPE_FIGMA: 'dev-equipe-figma',
} as const

export const ROUTE_PATHS = {
  HOME: '/',
  CONFIRM_WHATSAPP: '/c/:token',
  /** Alias legado documentado */
  CONFIRM_WHATSAPP_LEGACY: '/confirmar-whatsapp',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CONFIRM_EMAIL: '/auth/confirmar-email',
  CONFIRM_EMAIL_CODE: '/auth/confirmar-email/codigo',
  CONFIRM_EMAIL_SUCCESS: '/auth/confirmar-email/sucesso',
  /** Alias legado — links gerados pelo backend com FrontendBaseUrl na raiz do app */
  CONFIRM_EMAIL_LEGACY: '/confirmar-email',
  FORGOT_PASSWORD: '/auth/esqueci-senha',
  FORGOT_PASSWORD_CODE: '/auth/esqueci-senha/codigo',
  RESET_PASSWORD: '/auth/redefinir-senha',
  RESET_PASSWORD_SUCCESS: '/auth/redefinir-senha/sucesso',
  DASHBOARD: '/dashboard',
  EXPLORAR: '/explorar',
  MEUS_AGENDAMENTOS: '/meus-agendamentos',
  CONVITES: '/convites',
  PERFIL: '/perfil',
  LOJA: '/loja',
  AGENDAMENTO_REMARCACAO: '/agendamento/remarcacao',
  AVALIAR_ATENDIMENTO: '/avaliar',
  MEUS_AGENDAMENTOS_DETALHE: '/meus-agendamentos',
  ONBOARDING_PLANOS: '/onboarding/planos',
  ONBOARDING_CONTRATAR: '/onboarding/contratar',
  ONBOARDING_CHECKOUT: '/onboarding/checkout',
  ONBOARDING_ASSINATURA: '/onboarding/assinatura',
  ASSINATURA_PAGAMENTO_SUCESSO: '/assinatura/sucesso',
  ASSINATURA_PAGAMENTO_PENDENTE: '/assinatura/pendente',
  ASSINATURA_PAGAMENTO_FALHA: '/assinatura/falha',
  CONFIG_ASSINATURA: '/configuracoes/assinatura',
  CONFIG_ASSINATURA_FATURAS: '/configuracoes/assinatura/faturas',
  CONFIG_ASSINATURA_UPGRADE: '/configuracoes/assinatura/upgrade',
  UPGRADE: '/upgrade',
  AGENDA: '/agenda',
  SERVICOS: '/servicos',
  SERVICOS_NOVO: '/servicos/novo',
  SERVICOS_PROFISSIONAIS: '/servicos',
  FINANCEIRO: '/financeiro',
  CONFIG_EQUIPE: '/configuracoes/equipe',
  CONFIG_WHATSAPP: '/configuracoes/whatsapp',
  CONFIG_HORARIOS: '/configuracoes/horarios',
  CONFIG_PERFIL: '/configuracoes/perfil',
  CONFIG_CLIENTES: '/configuracoes/clientes',
  AGENDA_SEMANA: '/agenda/semana',
  AGENDA_MES: '/agenda/mes',
  AGENDA_DETALHE: '/agenda',
  CONFIG_EQUIPE_CONVITES: '/configuracoes/equipe/convites',
  CONFIG_EQUIPE_NOVO: '/configuracoes/equipe/novo',
  CONFIG_EQUIPE_USUARIO_NOVO: '/configuracoes/equipe/usuarios/novo',
  CONFIG_PROFISSIONAIS_VITRINE: '/configuracoes/profissionais-vitrine',
  FINANCEIRO_CAIXA: '/financeiro/caixa',
  FINANCEIRO_MOVIMENTACOES: '/financeiro/movimentacoes',
  FINANCEIRO_CONTAS: '/financeiro/contas',
  FINANCEIRO_COMISSOES: '/financeiro/comissoes',
  FINANCEIRO_RELATORIOS: '/financeiro/relatorios',
  FINANCEIRO_CONCILIACAO: '/financeiro/conciliacao',
  FINANCEIRO_REDE: '/financeiro/rede',
  FINANCEIRO_MINHAS_COMISSOES: '/financeiro/minhas-comissoes',
  FINANCEIRO_CONTAS_RECEBER: '/financeiro/contas-receber',
  FINANCEIRO_CONTAS_PAGAR: '/financeiro/contas-pagar',
  CONFIG_AUDITORIA: '/configuracoes/auditoria',
  CONFIG_PRIVACIDADE: '/configuracoes/privacidade',
  TERMOS_DE_USO: '/termos-de-uso',
  POLITICA_COOKIES: '/politica-de-cookies',
  DEV_SERVICOS_FIGMA: '/__dev/servicos-figma',
  DEV_EQUIPE_FIGMA: '/__dev/equipe-figma',
} as const

export function agendaDetalhePath(id: number): string {
  return `${ROUTE_PATHS.AGENDA_DETALHE}/${id}`
}

export function lojaDetalhePath(publicGuid: string): string {
  return `${ROUTE_PATHS.LOJA}/${publicGuid}`
}

export function lojaAgendarPath(publicGuid: string): string {
  return `${ROUTE_PATHS.LOJA}/${publicGuid}/agendar`
}

export function agendamentoDetalhePath(id: number): string {
  return `${ROUTE_PATHS.MEUS_AGENDAMENTOS_DETALHE}/${id}`
}

export function agendamentoAvaliarPath(id: number): string {
  return `${ROUTE_PATHS.MEUS_AGENDAMENTOS_DETALHE}/${id}/avaliar`
}

export function avaliarAtendimentoPath(token: string): string {
  return `${ROUTE_PATHS.AVALIAR_ATENDIMENTO}/${encodeURIComponent(token)}`
}

export function conviteResponderPath(token: string): string {
  return `${ROUTE_PATHS.CONVITES}/${encodeURIComponent(token)}`
}

export function servicoEditarPath(id: number): string {
  return `${ROUTE_PATHS.SERVICOS}/${id}`
}

export function servicoProfissionaisPath(id: number): string {
  return `${ROUTE_PATHS.SERVICOS}/${id}/profissionais`
}

export const LANDING_URL = (import.meta.env.VITE_LANDING_URL?.trim() || 'https://glowupconnect.com.br').replace(
  /\/+$/,
  '',
)
export const LANDING_PLANOS_URL = `${LANDING_URL}#planos`

export type AppLayout = 'auth' | 'dashboard' | 'public' | 'agendar-publico' | 'dev-preview'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: AppLayout
    requiresAuth?: boolean
    guestOnly?: boolean
    /** Apenas usuários com role Cliente */
    clienteOnly?: boolean
    /** Rotas operacionais — bloqueadas para Cliente */
    businessOnly?: boolean
    requerModulo?: string
    requerModulos?: string[]
    requerPermissao?: string
    requerPermissoes?: string[]
    requerAssinaturaAtiva?: boolean
    /** Rota exclusiva de planos sem o módulo indicado (ex.: vitrine Basic) */
    requerSemModulo?: string
    skipNegocioGuard?: boolean
    /** Checkout de assinatura — usuário Cliente recém-cadastrado pode acessar */
    allowClienteOnboarding?: boolean
    /** Fluxo wizard de assinatura (público até concluir etapa da conta) */
    onboardingAssinatura?: boolean
    /** Assinatura para usuário já autenticado (conta ativa) */
    assinaturaOnboardingLogado?: boolean
    /** Rota acessível quando a role na loja é Profissional */
    permitidoRoleProfissional?: boolean
    title?: string
  }
}
