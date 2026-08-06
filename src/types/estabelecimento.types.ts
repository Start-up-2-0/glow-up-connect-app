export interface EnderecoResumo {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

/** Catálogo de categorias de estabelecimento (extensível). */
export interface EstabelecimentoCategoria {
  id: number
  nome: string
  slug?: string
}

export interface EstabelecimentoProximo {
  publicGuid: string
  nome: string
  logo: string
  descricao: string
  distanciaKm: number
  endereco: EnderecoResumo
  destaqueMarketplace?: boolean
  notaMedia?: number
  totalAvaliacoes?: number
  categoriaId?: number
  categoria?: string
  /** Coordenadas do estabelecimento para o mapa (quando geocodificado). */
  latitude?: number | null
  longitude?: number | null
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
  notaMedia?: number
  totalAvaliacoes?: number
  abertoAgora?: boolean
  horarioAbertura?: string
  horarioFechamento?: string
  categoriaId?: number
  categoria?: string
}

export interface ListarProximosParams {
  latitude: number
  longitude: number
  raioKm?: number
  pagina?: number
  tamanhoPagina?: number
  /** Filtro por categoria de estabelecimento. */
  categoriaId?: number
}

export interface EnderecoPerfil {
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string | null
  enderecoCompleto: boolean
}

export interface EstabelecimentoPerfilCompleto {
  id: number
  publicGuid: string
  nome: string
  descricao?: string | null
  logo: string
  telefone: string
  email: string
  whatsAppConfirmado?: boolean
  whatsAppOptIn?: boolean
  whatsAppPendenteConfirmacao?: boolean
  categoriaId?: number
  categoria?: string
  endereco: EnderecoPerfil | null
}

export interface AtualizarEstabelecimentoPerfilPayload {
  nome?: string
  logo?: string
  descricao?: string
  telefone?: string
  email?: string
  categoriaId?: number
  endereco?: {
    cep: string
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    estado: string
    complemento?: string
  }
}

export interface ObterEstabelecimentoParams {
  latitude?: number
  longitude?: number
}
