import type { TutorialDefinition } from '@/tutorials/types'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

/** Tour educativo: explica o cadastro sem exigir abrir o form, preencher ou salvar. */
export const firstServiceMission: TutorialDefinition = {
  id: 'first-service',
  version: 2,
  kind: 'tutorial',
  title: 'Cadastre um serviço',
  description: 'Entenda os campos do formulário de serviço — sem precisar cadastrar agora.',
  estimatedMinutes: 2,
  routeName: ROUTE_NAMES.SERVICOS,
  routePath: ROUTE_PATHS.SERVICOS,
  module: 'Servicos',
  section: 'Gestão',
  requerModulo: 'Servicos',
  requerPermissao: 'ServicoGerenciar',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Serviços da loja',
      description:
        'Vou explicar como cadastrar um serviço. Este tour é só demonstrativo: nada precisa ser preenchido ou salvo.',
      interaction: 'blocked',
      allowBack: false,
    },
    {
      id: 'list',
      type: 'info',
      target: '[data-tour="servicos-page"]',
      title: 'Lista de serviços',
      description: 'Aqui ficam todos os serviços disponíveis para agendamento.',
      interaction: 'blocked',
    },
    {
      id: 'create',
      type: 'info',
      target: '[data-tour="servicos-novo"]',
      title: 'Novo serviço',
      description:
        'Use Novo serviço para abrir o formulário. Quando for criar de verdade, comece por aqui.',
      interaction: 'blocked',
    },
    {
      id: 'name',
      type: 'info',
      title: 'Nome do serviço',
      description:
        'No formulário, o nome é obrigatório. É o texto que o cliente vê ao agendar. Ex.: “Corte masculino com barba”.',
      interaction: 'blocked',
    },
    {
      id: 'price-duration',
      type: 'info',
      title: 'Preço e duração',
      description:
        'Informe o valor base (obrigatório) e a duração em minutos (ex.: 30). Isso orienta o agendamento e o financeiro.',
      interaction: 'blocked',
    },
    {
      id: 'type',
      type: 'info',
      title: 'Tipo do serviço',
      description: 'Escolha se é um atendimento individual ou um pacote com várias sessões.',
      interaction: 'blocked',
    },
    {
      id: 'professionals',
      type: 'info',
      title: 'Profissionais',
      description:
        'Opcional: vincule quem pode realizar o serviço. Útil quando a equipe é grande.',
      interaction: 'blocked',
      skipIf: (ctx) => !ctx.possuiModulo('Profissionais'),
    },
    {
      id: 'save',
      type: 'info',
      title: 'Salvar o serviço',
      description:
        'Com os dados prontos, use Salvar para gravar. Neste tour você não precisa salvar.',
      interaction: 'blocked',
    },
    {
      id: 'completion',
      type: 'completion',
      title: 'Tour concluído',
      description: 'Você já conhece os campos principais para cadastrar um serviço quando quiser.',
      interaction: 'blocked',
      allowBack: false,
    },
  ],
}

export const servicesTutorial: TutorialDefinition = {
  id: 'services',
  version: 2,
  kind: 'tutorial',
  title: 'Conheça seus serviços',
  description: 'Entenda a lista, o status e como editar um serviço.',
  estimatedMinutes: 1,
  routeName: ROUTE_NAMES.SERVICOS,
  routePath: ROUTE_PATHS.SERVICOS,
  module: 'Servicos',
  section: 'Gestão',
  requerModulo: 'Servicos',
  steps: [
    {
      id: 'intro',
      type: 'intro',
      title: 'Conheça seus serviços',
      description: 'Uma visão rápida da tela de serviços do estabelecimento.',
      interaction: 'blocked',
      allowBack: false,
    },
    {
      id: 'list',
      type: 'info',
      target: '[data-tour="servicos-page"]',
      title: 'Seus serviços',
      description: 'Aqui ficam os serviços disponíveis para seus clientes.',
      interaction: 'blocked',
    },
    {
      id: 'novo',
      type: 'info',
      target: '[data-tour="servicos-novo"]',
      title: 'Novo serviço',
      description: 'Use este botão sempre que quiser cadastrar um novo item.',
      interaction: 'blocked',
      skipIf: (ctx) => !ctx.possuiPermissao('ServicoGerenciar'),
    },
    {
      id: 'completion',
      type: 'completion',
      title: 'Tour concluído',
      description: 'Explore a lista ou abra o tour de cadastro quando for criar um serviço.',
      interaction: 'blocked',
      allowBack: false,
    },
  ],
}
