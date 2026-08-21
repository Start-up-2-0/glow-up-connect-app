import type { TutorialDefinition } from '@/tutorials/types'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const businessHoursTutorial: TutorialDefinition = {
  id: 'business-hours',
  version: 2,
  kind: 'tutorial',
  title: 'Configure seus horários',
  description: 'Aprenda onde definir os dias e horários de funcionamento da loja.',
  estimatedMinutes: 2,
  routeName: ROUTE_NAMES.CONFIG_HORARIOS,
  routePath: ROUTE_PATHS.CONFIG_HORARIOS,
  module: 'HorariosAtendimento',
  section: 'Configurações',
  requerModulo: 'HorariosAtendimento',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Conheça seus horários',
      description:
        'Vou mostrar como funciona a tela de horários. Nada precisa ser editado ou salvo neste tour.',
      interaction: 'blocked',
      allowBack: false,
    },
    {
      id: 'week-overview',
      type: 'info',
      target: '[data-tour="horarios-week"]',
      title: 'Sua semana',
      description: 'Cada card representa um dia de funcionamento da sua loja.',
      interaction: 'blocked',
    },
    {
      id: 'edit-day',
      type: 'info',
      target: '[data-tour="horario-edit-day"]',
      title: 'Editar um dia',
      description:
        'Use Editar dia ou Definir horário para abrir a configuração daquele dia.',
      tip: 'Quando for configurar de verdade, comece por este botão.',
      interaction: 'blocked',
    },
    {
      id: 'times',
      type: 'info',
      title: 'Abertura e fechamento',
      description:
        'Ao editar um dia, você informa início e fim (ex.: 09:00 às 18:00). Ambos são obrigatórios quando o dia está aberto, e o início deve ser antes do fim.',
      interaction: 'blocked',
    },
    {
      id: 'professionals',
      type: 'info',
      title: 'Profissionais do dia',
      description:
        'Na edição, você também pode escolher quem estará disponível naquele dia. É possível vincular mais de um profissional.',
      interaction: 'blocked',
      skipIf: (ctx) => Boolean(ctx.apenasHorarioProprio),
    },
    {
      id: 'save',
      type: 'info',
      title: 'Salvar alterações',
      description:
        'Depois de ajustar o dia, use Salvar para gravar. Neste tour você não precisa salvar nada.',
      interaction: 'blocked',
    },
    {
      id: 'completion',
      type: 'completion',
      title: 'Tour concluído',
      description: 'Agora você já sabe onde configurar os horários da loja quando precisar.',
      interaction: 'blocked',
      allowBack: false,
    },
  ],
}
