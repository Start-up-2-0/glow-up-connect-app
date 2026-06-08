export interface ServicoProfissionalResumo {
  profissionalId: number
  preco: number
  duracaoMinutos: number
  ativo: boolean
}

export interface Servico {
  id: number
  estabelecimentoId: number
  nome: string
  descricao: string
  precoBase: number
  duracaoMinutos: number
  ativo: boolean
  profissionais: ServicoProfissionalResumo[]
}

export interface ServicoPayload {
  nome: string
  descricao?: string
  precoBase: number
  duracaoMinutos: number
}

export interface ServicoFiltro {
  ativo?: boolean
}
