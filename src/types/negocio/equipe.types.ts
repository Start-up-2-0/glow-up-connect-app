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
  usuarioId: number
  role: EstablishmentUserRole
}

export interface ConvidarProfissionalPayload {
  profissionalId: number
  podeReceberAgendamento?: boolean
}
