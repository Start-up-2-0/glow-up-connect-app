export const LANDING_SECTIONS = {
  inicio: 'inicio',
  sobre: 'sobre',
  beneficios: 'beneficios',
  usuarios: 'usuarios',
  planos: 'planos',
} as const

export type BeneficioTab = 'usuarios' | 'profissionais' | 'estabelecimentos'

export interface BeneficioItem {
  titulo: string
  descricao: string
}

export const BENEFICIOS_POR_TAB: Record<BeneficioTab, BeneficioItem[]> = {
  usuarios: [
    {
      titulo: 'Agendamento fácil',
      descricao: 'Marque horários em poucos cliques, sem ligações ou mensagens demoradas.',
    },
    {
      titulo: 'Histórico completo',
      descricao: 'Acompanhe seus atendimentos, preferências e profissionais favoritos.',
    },
    {
      titulo: 'Lembretes automáticos',
      descricao: 'Receba notificações para não perder nenhum compromisso.',
    },
    {
      titulo: 'Avaliações e confiança',
      descricao: 'Escolha estabelecimentos com base em experiências reais de outros clientes.',
    },
  ],
  profissionais: [
    {
      titulo: 'Agenda inteligente',
      descricao: 'Organize horários, bloqueios e atendimentos em um só lugar.',
    },
    {
      titulo: 'Mais visibilidade',
      descricao: 'Destaque seu trabalho e conquiste novos clientes na plataforma.',
    },
    {
      titulo: 'Gestão simplificada',
      descricao: 'Controle serviços, comissões e desempenho sem planilhas.',
    },
    {
      titulo: 'Comunicação direta',
      descricao: 'Mantenha contato com clientes por canais integrados.',
    },
  ],
  estabelecimentos: [
    {
      titulo: 'Operação centralizada',
      descricao: 'Equipe, serviços e agenda unificados em um painel completo.',
    },
    {
      titulo: 'Controle financeiro',
      descricao: 'Acompanhe faturamento, cobranças e indicadores do negócio.',
    },
    {
      titulo: 'Módulos sob medida',
      descricao: 'Ative apenas o que precisa conforme o plano contratado.',
    },
    {
      titulo: 'Crescimento escalável',
      descricao: 'Evolua do básico ao premium conforme sua operação expande.',
    },
  ],
}

export const LANDING_STATS = [
  { valor: '4k+', rotulo: 'Usuários ativos' },
  { valor: '12k+', rotulo: 'Agendamentos/mês' },
  { valor: '2k+', rotulo: 'Profissionais' },
  { valor: '96%', rotulo: 'Satisfação' },
] as const

export const SOBRE_FEATURES = [
  {
    titulo: 'Tecnologia acessível',
    descricao: 'Ferramentas modernas para salões, clínicas e profissionais autônomos.',
  },
  {
    titulo: 'Experiência fluida',
    descricao: 'Interface pensada para quem agenda e para quem atende, no mesmo ecossistema.',
  },
  {
    titulo: 'Suporte próximo',
    descricao: 'Acompanhamento humano para você extrair o máximo da plataforma.',
  },
] as const
