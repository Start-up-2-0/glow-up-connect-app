import { ROUTE_PATHS } from '@/constants/routes'
import { FEATURE_FLAGS } from '@/config/features'

export interface PageChromeMeta {
  title: string
  description: string
  /** Segmentos do breadcrumb além da raiz implícita */
  crumbs?: { label: string; to?: string }[]
}

const pages: Record<string, PageChromeMeta> = {
  [ROUTE_PATHS.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Acompanhe o desempenho da sua loja em tempo real.',
    crumbs: [{ label: 'Dashboard' }],
  },
  [ROUTE_PATHS.EXPLORAR]: {
    title: FEATURE_FLAGS.lojasHabilitadas ? 'Explorar lojas' : 'Explorar profissionais',
    description: FEATURE_FLAGS.lojasHabilitadas
      ? 'Encontre estabelecimentos e profissionais perto de você.'
      : 'Encontre profissionais perto de você.',
    crumbs: [{ label: 'Explorar' }],
  },
  [ROUTE_PATHS.MEUS_AGENDAMENTOS]: {
    title: 'Meus agendamentos',
    description: 'Veja, remarque ou cancele seus próximos horários.',
    crumbs: [{ label: 'Agendamentos' }],
  },
  [ROUTE_PATHS.PERFIL]: {
    title: 'Perfil',
    description: 'Gerencie seus dados pessoais e preferências.',
    crumbs: [{ label: 'Conta' }, { label: 'Perfil' }],
  },
  [ROUTE_PATHS.AGENDA]: {
    title: 'Agenda',
    description: 'Organize atendimentos e disponibilidade do dia.',
    crumbs: [{ label: 'Gestão' }, { label: 'Agenda' }],
  },
  [ROUTE_PATHS.CONFIG_CLIENTES]: {
    title: 'Clientes',
    description: 'Base de clientes e histórico de atendimento.',
    crumbs: [{ label: 'Gestão' }, { label: 'Clientes' }],
  },
  [ROUTE_PATHS.SERVICOS]: {
    title: 'Serviços',
    description: 'Catálogo de serviços oferecidos pela loja.',
    crumbs: [{ label: 'Gestão' }, { label: 'Serviços' }],
  },
  [ROUTE_PATHS.CONFIG_PROFISSIONAIS_VITRINE]: {
    title: 'Profissionais',
    description: 'Equipe visível na vitrine e no agendamento.',
    crumbs: [{ label: 'Gestão' }, { label: 'Profissionais' }],
  },
  [ROUTE_PATHS.FINANCEIRO]: {
    title: 'Financeiro',
    description: 'Caixa, movimentos e visão geral do negócio.',
    crumbs: [{ label: 'Financeiro' }, { label: 'Visão geral' }],
  },
  [ROUTE_PATHS.FINANCEIRO_COMISSOES]: {
    title: 'Comissões',
    description: 'Acompanhe comissões e metas da equipe.',
    crumbs: [{ label: 'Financeiro' }, { label: 'Comissões' }],
  },
  [ROUTE_PATHS.CONFIG_ASSINATURA]: {
    title: 'Assinatura',
    description: 'Plano atual, benefícios e renovação.',
    crumbs: [{ label: 'Financeiro' }, { label: 'Assinatura' }],
  },
  [ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS]: {
    title: 'Faturas',
    description: 'Histórico de cobranças e comprovantes.',
    crumbs: [{ label: 'Financeiro' }, { label: 'Faturas' }],
  },
  [ROUTE_PATHS.CONFIG_PERFIL]: {
    title: 'Minha loja',
    description: 'Dados públicos e identidade do estabelecimento.',
    crumbs: [{ label: 'Configurações' }, { label: 'Minha loja' }],
  },
  [ROUTE_PATHS.CONFIG_EQUIPE]: {
    title: 'Equipe',
    description: 'Membros, papéis e convites da loja.',
    crumbs: [{ label: 'Configurações' }, { label: 'Equipe' }],
  },
  [ROUTE_PATHS.CONFIG_HORARIOS]: {
    title: 'Horários',
    description: 'Funcionamento e disponibilidade de atendimento.',
    crumbs: [{ label: 'Configurações' }, { label: 'Horários' }],
  },
  [ROUTE_PATHS.CONFIG_WHATSAPP]: {
    title: 'Integrações',
    description: 'WhatsApp e canais conectados à sua loja.',
    crumbs: [{ label: 'Configurações' }, { label: 'Integrações' }],
  },
  [ROUTE_PATHS.CONFIG_AUDITORIA]: {
    title: 'Auditoria',
    description: 'Registro de ações relevantes no sistema.',
    crumbs: [{ label: 'Configurações' }, { label: 'Auditoria' }],
  },
  [ROUTE_PATHS.CONFIG_PRIVACIDADE]: {
    title: 'Preferências',
    description: 'Privacidade, dados e consentimentos.',
    crumbs: [{ label: 'Configurações' }, { label: 'Preferências' }],
  },
  [ROUTE_PATHS.ONBOARDING_PLANOS]: {
    title: FEATURE_FLAGS.lojasHabilitadas ? 'Abrir minha loja' : 'Escolher plano',
    description: FEATURE_FLAGS.lojasHabilitadas
      ? 'Escolha um plano e comece a operar.'
      : 'Escolha um plano para profissionais autônomos.',
    crumbs: [
      { label: 'Conta' },
      { label: FEATURE_FLAGS.lojasHabilitadas ? 'Abrir loja' : 'Planos' },
    ],
  },
}

export function resolvePageChrome(
  path: string,
  routeTitle?: string,
): PageChromeMeta {
  const exact = pages[path]
  if (exact) return exact

  const byPrefix = Object.entries(pages)
    .filter(([key]) => key !== '/' && path.startsWith(key + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0]

  if (byPrefix) {
    const base = byPrefix[1]
    const leaf = routeTitle ?? path.split('/').filter(Boolean).at(-1) ?? 'Detalhe'
    return {
      title: routeTitle ?? base.title,
      description: base.description,
      crumbs: [...(base.crumbs ?? [{ label: base.title }]), { label: leaf }],
    }
  }

  const title = routeTitle ?? 'Dashboard'
  return {
    title,
    description: 'Navegue pela plataforma Glow Up Connect.',
    crumbs: [{ label: title }],
  }
}
