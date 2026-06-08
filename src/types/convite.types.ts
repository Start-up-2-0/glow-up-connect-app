export interface ConviteNegocio {
  id: number
  estabelecimentoId: number
  email: string
  tipoConvite: string
  roleSugerida: string
  status: string
  expiraEm: string
  criadoEm: string
}

export interface ConviteCriado extends ConviteNegocio {
  linkConvite: string
}

export interface ConvitePreview {
  estabelecimentoId: number
  nomeEstabelecimento: string
  email: string
  tipoConvite: string
  roleSugerida: string
  status: string
  expiraEm: string
}

export type StatusConviteFiltro = 'Pendente' | 'Aceito' | 'Rejeitado' | 'Cancelado' | 'Expirado'
