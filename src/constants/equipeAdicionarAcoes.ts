import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'

export interface EquipeAdicionarAcaoCopy {
  modo: ModoCadastro
  /** Texto curto no menu ou card */
  titulo: string
  /** Explicação em linguagem simples */
  descricao: string
  /** Título do modal */
  tituloModal: string
  /** Instrução dentro do formulário */
  instrucao: string
  badge?: string
  botaoConfirmar: string
  botaoConfirmarProfissional?: string
}

export const EQUIPE_ADICIONAR_ACOES: EquipeAdicionarAcaoCopy[] = [
  {
    modo: 'convite',
    titulo: 'Pessoa ainda não entrou',
    descricao: 'Ela ainda não usa o sistema. Você manda um link e ela cria a senha.',
    tituloModal: 'Chamar pessoa para a equipe',
    instrucao:
      'Use o e-mail da pessoa. Se ela ainda não entrou, você recebe um link para enviar. Se já tiver conta ativa, entra direto na equipe.',
    badge: 'Mais fácil',
    botaoConfirmar: 'Gerar link para enviar',
    botaoConfirmarProfissional: 'Gerar link para enviar',
  },
  {
    modo: 'vincular',
    titulo: 'Pessoa já confirmou o cadastro',
    descricao: 'Ela já criou conta e confirmou o e-mail. Adicione direto, sem link.',
    tituloModal: 'Adicionar quem já tem cadastro',
    instrucao:
      'Use o mesmo e-mail que a pessoa cadastrou. Ela entra na equipe na hora, sem precisar de link.',
    botaoConfirmar: 'Adicionar à equipe',
    botaoConfirmarProfissional: 'Adicionar profissional',
  },
  {
    modo: 'criar',
    titulo: 'Eu crio a senha',
    descricao: 'Use só se a pessoa não conseguir se cadastrar sozinha.',
    tituloModal: 'Cadastrar pessoa com senha',
    instrucao:
      'Preencha os dados da pessoa e defina uma senha para ela entrar. Ela pode trocar a senha depois.',
    badge: 'Só se precisar',
    botaoConfirmar: 'Salvar e adicionar',
    botaoConfirmarProfissional: 'Salvar profissional',
  },
]

export function equipeAdicionarAcao(modo: ModoCadastro): EquipeAdicionarAcaoCopy {
  const acao = EQUIPE_ADICIONAR_ACOES.find((a) => a.modo === modo)
  if (!acao) {
    return EQUIPE_ADICIONAR_ACOES[0]!
  }
  return acao
}

export function equipeAdicionarBotaoConfirmar(
  modo: ModoCadastro,
  ehProfissional: boolean,
): string {
  const acao = equipeAdicionarAcao(modo)
  if (ehProfissional && acao.botaoConfirmarProfissional) {
    return acao.botaoConfirmarProfissional
  }
  return acao.botaoConfirmar
}
