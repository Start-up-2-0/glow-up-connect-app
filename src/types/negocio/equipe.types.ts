export type EstablishmentUserRole =
  | 'Owner'
  | 'Admin'
  | 'Manager'
  | 'Receptionist'
  | 'Profissional'

export interface UsuarioEquipe {
  id: number
  estabelecimentoId: number
  usuarioId: number
  nome: string
  email: string
  telefone: string
  role: EstablishmentUserRole
  ativo: boolean
}

export interface ProfissionalEquipe {
  id: number
  estabelecimentoId: number
  profissionalId: number
  usuarioId: number
  nomePublico: string
  email: string
  telefone: string
  podeReceberAgendamento: boolean
  ativo: boolean
}

export interface CadastrarUsuarioEquipePayload {
  email?: string
  telefone?: string
  role: EstablishmentUserRole
}

/** Vínculo direto quando o profissional já existe na plataforma. */
export interface ConvidarProfissionalEquipePayload {
  email?: string
  telefone?: string
  nomePublico?: string
  podeReceberAgendamento?: boolean
}

/** Convite por e-mail (fluxo com token e aceite). */
export interface CriarConviteProfissionalPayload {
  email: string
  telefone?: string
  nomePublico?: string
  podeReceberAgendamento?: boolean
}
