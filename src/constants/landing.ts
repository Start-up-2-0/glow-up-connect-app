export const LANDING_SECTIONS = {
  inicio: 'inicio',
  sobre: 'sobre',
  beneficios: 'beneficios',
  usuarios: 'usuarios',
  planos: 'planos',
} as const

export type BeneficioTab = 'usuarios' | 'profissionais' | 'estabelecimentos'

export type BeneficioIconId =
  | 'calendar-fast'
  | 'location'
  | 'history'
  | 'bell'
  | 'calendar-smart'
  | 'visibility'
  | 'clipboard'
  | 'chat'
  | 'dashboard'
  | 'finance'
  | 'modules'
  | 'marketplace'

export interface BeneficioItem {
  titulo: string
  descricao: string
  icon: BeneficioIconId
}

export const BENEFICIOS_INTRO: Record<BeneficioTab, { linha1: string; destaque1: string; linha2: string; destaque2: string }> = {
  usuarios: {
    linha1: 'Encontre e agende os ',
    destaque1: 'melhores',
    linha2: ' profissionais de beleza ',
    destaque2: 'perto de você',
  },
  profissionais: {
    linha1: 'Gerencie sua agenda e conquiste ',
    destaque1: 'mais clientes',
    linha2: ' com ferramentas feitas para o seu ',
    destaque2: 'dia a dia',
  },
  estabelecimentos: {
    linha1: 'Centralize equipe, serviços e ',
    destaque1: 'financeiro',
    linha2: ' para ',
    destaque2: 'crescer com controle',
  },
}

export const BENEFICIOS_POR_TAB: Record<BeneficioTab, BeneficioItem[]> = {
  usuarios: [
    {
      titulo: 'Agendamento rápido',
      icon: 'calendar-fast',
      descricao:
        'Marque horários em poucos toques, sem filas de mensagem ou ligações para confirmar disponibilidade.',
    },
    {
      titulo: 'Profissionais perto de você',
      icon: 'location',
      descricao:
        'Descubra salões e especialistas da sua região com informações claras sobre serviços e horários.',
    },
    {
      titulo: 'Histórico organizado',
      icon: 'history',
      descricao:
        'Acompanhe seus atendimentos, preferências e estabelecimentos favoritos em um só lugar.',
    },
    {
      titulo: 'Lembretes automáticos',
      icon: 'bell',
      descricao:
        'Receba avisos para não perder compromissos e reagendar com praticidade quando precisar.',
    },
  ],
  profissionais: [
    {
      titulo: 'Agenda inteligente',
      icon: 'calendar-smart',
      descricao:
        'Organize horários, bloqueios e atendimentos com uma visão simples da sua rotina.',
    },
    {
      titulo: 'Mais visibilidade',
      icon: 'visibility',
      descricao:
        'Apareça para novos clientes e fortaleça sua presença digital dentro da plataforma.',
    },
    {
      titulo: 'Gestão sem planilhas',
      icon: 'clipboard',
      descricao:
        'Controle serviços, desempenho e informações do negócio sem depender de controles manuais.',
    },
    {
      titulo: 'Comunicação integrada',
      icon: 'chat',
      descricao:
        'Mantenha o relacionamento com clientes por canais conectados ao fluxo de agendamento.',
    },
  ],
  estabelecimentos: [
    {
      titulo: 'Operação centralizada',
      icon: 'dashboard',
      descricao:
        'Unifique equipe, serviços e agenda em um painel pensado para o dia a dia do salão.',
    },
    {
      titulo: 'Controle financeiro',
      icon: 'finance',
      descricao:
        'Acompanhe faturamento, cobranças e indicadores para tomar decisões com mais clareza.',
    },
    {
      titulo: 'Módulos sob medida',
      icon: 'modules',
      descricao:
        'Ative apenas o que sua operação precisa, evoluindo conforme o negócio cresce.',
    },
    {
      titulo: 'Destaque no marketplace',
      icon: 'marketplace',
      descricao:
        'Ganhe prioridade na listagem pública e amplie o alcance da sua marca na região.',
    },
  ],
}

export const LANDING_STATS = [
  { valor: '4k+', rotulo: 'Usuários ativos' },
  { valor: '12k+', rotulo: 'Agendamentos realizados' },
  { valor: '2k+', rotulo: 'Profissionais cadastrados' },
  { valor: '96%', rotulo: 'Aprovação dos clientes' },
] as const

export const SOBRE_BODY = [
  'O Glow Up Connect é a plataforma que conecta quem busca',
  'beleza com quem a cria. Unimos clientes, profissionais autônomos',
  'e estabelecimentos em um ecossistema digital pensado para',
  'simplificar agendamentos e potencializar negócios.',
] as const

export const SOBRE_FEATURES = [
  {
    titulo: 'Conexão real',
    descricao:
      'Aproximamos clientes e profissionais com uma experiência digital simples, humana e eficiente.',
  },
  {
    titulo: 'Gestão integrada',
    descricao:
      'Agenda, serviços e relacionamento em um só ecossistema para quem atende e para quem administra.',
  },
  {
    titulo: 'Crescimento contínuo',
    descricao:
      'Ferramentas que evoluem com o seu negócio, do primeiro agendamento à operação completa.',
  },
] as const

export const FOOTER_TAGLINE = [
  'A plataforma completa para profissionais que',
  'buscam excelência em cada atendimento e',
  'brilho em cada resultado.',
] as const
