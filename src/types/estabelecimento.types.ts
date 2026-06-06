export interface EnderecoResumo {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export interface EstabelecimentoProximo {
  publicGuid: string
  nome: string
  logo: string
  descricao: string
  distanciaKm: number
  endereco: EnderecoResumo
}

export interface EstabelecimentosProximosResponse {
  cidade: string
  estado: string
  raioKm: number
  total: number
  itens: EstabelecimentoProximo[]
}

export interface EstabelecimentoPublico {
  publicGuid: string
  nome: string
  logo: string
  descricao: string
  endereco: EnderecoResumo | null
  distanciaKm: number | null
}

export interface ListarProximosParams {
  latitude: number
  longitude: number
  raioKm?: number
  pagina?: number
  tamanhoPagina?: number
}

export interface ObterEstabelecimentoParams {
  latitude?: number
  longitude?: number
}
