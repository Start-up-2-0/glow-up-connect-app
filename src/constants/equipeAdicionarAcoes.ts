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
    descricao: 'Mande um link por WhatsApp ou e-mail. A pessoa cria a própria senha.',
    tituloModal: 'Chamar pessoa para a equipe',
    instrucao:
      'Coloque o e-mail da pessoa e escolha o que ela vai fazer no negócio. Depois copie o link e envie para ela.',
    badge: 'Mais fácil',
    botaoConfirmar: 'Gerar link para enviar',
    botaoConfirmarProfissional: 'Gerar link para enviar',
  },
  {
    modo: 'vincular',
    titulo: 'Pessoa já se cadastrou',
    descricao: 'A pessoa já tem conta no Glow Up. Use o e-mail ou telefone dela.',
    tituloModal: 'Adicionar quem já tem cadastro',
    instrucao:
      'Informe o e-mail ou o telefone da pessoa. Ela precisa já ter confirmado o e-mail no cadastro.',
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
