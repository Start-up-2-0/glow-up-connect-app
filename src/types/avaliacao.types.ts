export type AvaliacaoStatus = 'Indisponivel' | 'Pendente' | 'Realizada'

export interface AvaliacaoResumoCliente {
  notaEstabelecimento: number
  notaProfissional: number
  avaliadoEm: string
}

export interface AvaliacaoContexto {
  status: AvaliacaoStatus | string
  agendamentoId: number
  estabelecimentoPublicGuid: string
  estabelecimentoNome: string
  estabelecimentoLogo: string
  profissionalId: number
  profissionalNome: string
  profissionalLogo: string
  atendimentoInicio: string
  atendimentoFim: string
  avaliacao?: AvaliacaoResumoCliente | null
}

export interface CriarAvaliacaoPayload {
  notaEstabelecimento: number
  comentarioEstabelecimento?: string | null
  notaProfissional: number
  comentarioProfissional?: string | null
}

export interface AvaliacaoDistribuicaoItem {
  nota: number
  quantidade: number
}

export interface AvaliacaoResumoPublico {
  notaMedia: number
  totalAvaliacoes: number
  janelaDias: number
  distribuicao: AvaliacaoDistribuicaoItem[]
}

export interface AvaliacaoComentarioItem {
  nota: number
  comentario?: string | null
  avaliadoEm: string
  clienteNome: string
}

export interface AvaliacoesPaginadas {
  resumo: AvaliacaoResumoPublico
  total: number
  pagina: number
  tamanhoPagina: number
  itens: AvaliacaoComentarioItem[]
}
