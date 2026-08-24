export type FavoritoTipo = 'Loja' | 'ProfissionalLoja' | 'ProfissionalAutonomo'

export interface FavoritoCliente {
  id: number
  estabelecimentoPublicGuid: string
  estabelecimentoNome: string
  estabelecimentoLogo: string
  profissionalPublicGuid?: string | null
  profissionalNome?: string | null
  profissionalLogo?: string | null
  tipo: FavoritoTipo
  criadoEm: string
}

export interface CriarFavoritoPayload {
  estabelecimentoPublicGuid: string
  profissionalPublicGuid?: string | null
}
