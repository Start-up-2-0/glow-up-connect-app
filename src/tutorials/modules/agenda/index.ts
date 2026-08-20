import type { TutorialDefinition } from '@/tutorials/types'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const agendaTutorial: TutorialDefinition = {
  id: 'agenda',
  version: 1,
  kind: 'tutorial',
  title: 'Conheça sua agenda',
  description: 'Navegue entre períodos, mude a visão e filtre agendamentos.',
  estimatedMinutes: 2,
  routeName: ROUTE_NAMES.AGENDA,
  routePath: ROUTE_PATHS.AGENDA,
  module: 'Agenda',
  section: 'Gestão',
  requerModulo: 'Agenda',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Conheça sua agenda',
      description:
        'Vou mostrar como navegar no calendário, alternar visões e filtrar por status.',
      interaction: 'blocked',
      allowBack: false,
    },
    {
      id: 'nav',
      type: 'info',
      target: '[data-tour="agenda-nav"]',
      title: 'Navegação',
      description: 'Avance, volte ou volte para hoje para mudar o período exibido.',
      interaction: 'blocked',
    },
    {
      id: 'views',
      type: 'info',
      target: '[data-tour="agenda-views"]',
      title: 'Visões',
      description: 'Alterne entre mês, semana e dia conforme a necessidade do dia a dia.',
      interaction: 'blocked',
    },
    {
      id: 'filter',
      type: 'info',
      target: '[data-tour="agenda-status-filter"]',
      title: 'Filtro de status',
      description: 'Filtre agendamentos por status para focar no que importa.',
      interaction: 'blocked',
    },
    {
      id: 'calendar',
      type: 'info',
      target: '[data-tour="agenda-calendar"]',
      title: 'Calendário',
      description: 'Os agendamentos aparecem aqui. Clique em um evento para ver os detalhes.',
      interaction: 'blocked',
    },
    {
      id: 'completion',
      type: 'completion',
      title: 'Tutorial concluído',
      description: 'Você já sabe navegar pela agenda do Glow Up.',
      interaction: 'blocked',
      allowBack: false,
    },
  ],
}
