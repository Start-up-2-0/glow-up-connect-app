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

import type { ProfissionalEquipe, UsuarioEquipe } from '@/types/negocio/equipe.types'

export interface ConviteCriado extends ConviteNegocio {
  linkConvite: string
}

export type TipoResultadoConvite = 'Convite' | 'Vinculado'

export interface ConviteOuVinculo {
  tipoResultado: TipoResultadoConvite
  linkConvite?: string | null
  convite?: ConviteCriado | null
  vinculoUsuario?: UsuarioEquipe | null
  vinculoProfissional?: ProfissionalEquipe | null
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
