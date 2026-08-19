export type TipoServico = 'Individual' | 'Combo'

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
  tipoServico: TipoServico
  imagem?: string | null
  ativo: boolean
  profissionais: ServicoProfissionalResumo[]
}

export interface ServicoPayload {
  nome: string
  descricao?: string
  precoBase: number
  duracaoMinutos: number
  tipoServico?: TipoServico
  imagem?: string
  imagemContentType?: string
}

export interface ServicoFiltro {
  ativo?: boolean
}

export interface VincularServicoProfissionalPayload {
  preco?: number
  duracaoMinutos?: number
}

export interface AtualizarVinculoServicoProfissionalPayload {
  preco: number
  duracaoMinutos: number
}

export interface ProfissionalServicoVinculo {
  id: number
  profissionalId: number
  servicoId: number
  preco: number
  duracaoMinutos: number
  ativo: boolean
}
