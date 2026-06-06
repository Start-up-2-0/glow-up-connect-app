export type UserRole = 1 | 2 | 3 | 4 | 5

export const USER_ROLE = {
  CLIENTE: 1,
  DONO_ESTABELECIMENTO: 2,
  PROFISSIONAL_AUTONOMO: 3,
  PROFISSIONAL_ESTABELECIMENTO: 4,
  ADMIN: 5,
} as const satisfies Record<string, UserRole>

export function normalizeUserRole(role: UserRole | string | number): UserRole {
  if (typeof role === 'number' && role >= 1 && role <= 5) return role as UserRole
  const map: Record<string, UserRole> = {
    Cliente: 1,
    DonoEstabelecimento: 2,
    ProfissionalAutonomo: 3,
    ProfissionalEstabelecimento: 4,
    Admin: 5,
  }
  const key = String(role)
  return map[key] ?? 1
}

export function isClienteRole(role: UserRole | string | number | undefined): boolean {
  if (role === undefined) return false
  return normalizeUserRole(role) === USER_ROLE.CLIENTE
}

export interface User {
  id: number
  nome: string
  email: string
  telefone?: string
  role: UserRole
  ativo: boolean
  avatarBase64?: string | null
  whatsAppConfirmado?: boolean
  whatsAppOptIn?: boolean
  whatsAppPendenteConfirmacao?: boolean
  createdAt?: string
  updatedAt?: string | null
}

export interface UserSummary {
  id: number
  nome: string
  email: string
  role: UserRole
  avatarBase64?: string | null
}

export interface CadastroPayload {
  nome: string
  email: string
  telefone: string
  senha: string
  avatarBase64?: string
  avatarContentType?: string
}

export interface CadastroResponse {
  id: number
  nome: string
  email: string
  telefone: string
  ativo: boolean
  avatarBase64?: string | null
  mensagem: string
}

export interface UpdateProfilePayload {
  nome?: string
  telefone?: string
  avatarBase64?: string | null
  avatarContentType?: string
}

export interface ChangePasswordPayload {
  senhaAtual: string
  senha: string
  confirmarSenha: string
}

export interface EstabelecimentoAcesso {
  estabelecimentoId: number
  publicGuid: string
  nome: string
  logo: string
  role: string
  possuiVinculoProfissional: boolean
  permissoes: string[]
  assinaturaAtiva: boolean
  assinaturaId?: number | null
  planoId?: number | null
  planoNome?: string | null
  modulos: string[]
}
