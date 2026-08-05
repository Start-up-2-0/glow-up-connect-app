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
  /** Foto de apresentação do profissional (não é o avatar da conta). */
  foto?: string | null
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
  /** Foto de apresentação (data URI). Independente do avatar da conta. */
  foto?: string
  fotoContentType?: string
}

export interface AtualizarProfissionalEquipePayload {
  nomePublico?: string
  biografia?: string
  foto?: string
  fotoContentType?: string
  removerFoto?: boolean
}

export interface EquipeMembrosFiltro {
  busca?: string
  cargo?: string
  status?: string
  pagina?: number
  tamanhoPagina?: number
}

export interface EquipeMembrosResumo {
  totalMembros: number
  administradores: number
  profissionais: number
  recepcionistas: number
  convidados: number
}

export interface MembroEquipeApiItem {
  id: string
  tipo: 'usuario' | 'profissional' | 'convite'
  nome: string
  cargo: string
  role: string
  email?: string | null
  telefone?: string | null
  ativo: boolean
  usuarioId?: number | null
  profissionalId?: number | null
  podeReceberAgendamento?: boolean | null
  foto?: string | null
  conviteEm?: string | null
}

export interface EquipeMembrosPaginado {
  total: number
  pagina: number
  tamanhoPagina: number
  itens: MembroEquipeApiItem[]
  resumo: EquipeMembrosResumo
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
  cancelarAgendamentosFuturos?: boolean
  motivoCancelamento?: string
}

export interface AgendamentoFuturoEquipe {
  agendamentoId: number
  agendamentoItemId: number
  clienteNome: string
  servicoNome: string
  inicio: string
  fim: string
  status: string
}

export interface CancelarAgendamentosFuturosProfissionalEquipePayload {
  motivo: string
}

export interface CancelarAgendamentosFuturosProfissionalEquipeResult {
  quantidadeCancelada: number
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
  /** Foto do profissional (só quando tipo profissional / vínculo com foto). */
  foto?: string | null
}
