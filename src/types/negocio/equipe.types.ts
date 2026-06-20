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
  notaMedia?: number | null
  totalAvaliacoes?: number
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

/** Convite nominativo para Admin, Gerente ou Recepcionista. */
export interface CriarConviteUsuarioEquipePayload {
  email: string
  role: 'Admin' | 'Manager' | 'Receptionist'
}

export interface AtualizarRoleUsuarioEquipePayload {
  role: EstablishmentUserRole
}

export interface AtualizarStatusUsuarioEquipePayload {
  ativo: boolean
}

export interface AtualizarStatusProfissionalEquipePayload {
  ativo: boolean
  podeReceberAgendamento: boolean
}

export type MembroEquipeTipo = 'usuario' | 'profissional'

/** Membro unificado exibido na listagem da equipe. */
export interface MembroEquipeItem {
  id: string
  tipo: MembroEquipeTipo
  nome: string
  cargo: string
  role: EstablishmentUserRole | 'Profissional'
  email?: string
  telefone?: string
  ativo: boolean
  usuarioId: number
  profissionalId?: number
  podeReceberAgendamento?: boolean
}
