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
    titulo: 'Gerar convite',
    descricao:
      'Se a pessoa já tem conta, entra direto. Se não, ela recebe um link para se cadastrar.',
    tituloModal: 'Gerar convite',
    instrucao:
      'Informe o e-mail e o cargo. O sistema verifica se a pessoa já tem conta: entra na hora ou recebe um link para se cadastrar.',
    badge: 'Recomendado',
    botaoConfirmar: 'Gerar convite',
    botaoConfirmarProfissional: 'Gerar convite',
  },
  {
    modo: 'criar',
    titulo: 'Cadastrar manualmente',
    descricao: 'Você preenche os dados e cria a senha. Use só se a pessoa não conseguir sozinha.',
    tituloModal: 'Cadastrar manualmente',
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

/** Compatibilidade com links antigos (?acao=vincular). */
export function normalizarModoAcao(valor: unknown): ModoCadastro | null {
  if (valor === 'convite' || valor === 'vincular') return 'convite'
  if (valor === 'criar') return 'criar'
  return null
}
