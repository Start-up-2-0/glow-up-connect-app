export type StatusConviteNegocio = 'Ativo' | 'Expirado' | 'Esgotado' | 'Cancelado'

export type UnidadeDuracaoConvite = 'Minutos' | 'Horas' | 'Dias'

export interface ConviteNegocio {
  id: number
  estabelecimentoId: number
  roleSugerida: string
  tipoConvite: string
  status: string
  limiteUsuarios: number
  quantidadeUtilizacoes: number
  expiraEm: string
  criadoEm: string
}

export interface ConviteCriado extends ConviteNegocio {
  linkConvite: string
}

export interface ConvitePreview {
  estabelecimentoId: number
  nomeEstabelecimento: string
  roleSugerida: string
  status: string
  limiteUsuarios: number
  quantidadeUtilizacoes: number
  vagasRestantes: number
  expiraEm: string
}

export interface CriarConviteLinkPayload {
  role: string
  limiteUsuarios: number
  duracaoValor?: number | null
  duracaoUnidade?: UnidadeDuracaoConvite | null
  podeReceberAgendamento?: boolean
}

export type StatusConviteFiltro = StatusConviteNegocio
