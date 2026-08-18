/**
 * Tipos de referência — GLOWAPI Auth & Cadastro
 * Copiar/adaptar em src/types/ conforme necessário.
 * Fonte: docs/frontend-auth.md
 */

// --- Cadastro ---

export interface CadastrarUsuarioRequest {
  nome: string
  email: string
  telefone: string
  senha: string
  avatarBase64?: string
  avatarContentType?: string
}

export interface CadastrarUsuarioResponse {
  id: number
  nome: string
  email: string
  telefone: string
  ativo: boolean
  avatarBase64: string | null
  mensagem: string
}

// --- Envelope padrão ---

export interface ApiSuccessResponse<T = void> {
  success: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  code: string
  details?: unknown
}

export interface ValidationProblemDetails {
  type?: string
  title?: string
  status: number
  errors?: Record<string, string[]>
}

// --- Login ---

export interface LoginRequest {
  email: string
  senha: string
}

export type UserRole = 1 | 2 | 3 | 4 | 5

export interface UsuarioSummary {
  id: number
  nome: string
  email: string
  role: UserRole
  avatarBase64: string | null
}

export interface AuthTokens {
  token: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
}

export interface LoginData extends AuthTokens {
  usuario: UsuarioSummary
}

export type LoginResponse = ApiSuccessResponse<LoginData>

// --- Refresh ---

export interface RefreshRequest {
  refreshToken: string
}

export type RefreshResponse = ApiSuccessResponse<AuthTokens>

// --- Confirmacao ---

export interface ConfirmarEmailRequest {
  token?: string
  codigo?: string
}

export interface ReenviarConfirmacaoRequest {
  email: string
}

// --- Perfil (GET /api/usuario/me — DTO direto) ---

export interface UsuarioMe {
  id: number
  nome: string
  email: string
  telefone: string
  role: UserRole
  ativo: boolean
  avatarBase64: string | null
  createdAt: string
  updatedAt: string | null
}

// --- Recuperacao de senha ---

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token?: string
  codigo?: string
  senha: string
  confirmarSenha: string
}

// --- Codigos de erro conhecidos ---

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_NAO_CONFIRMADO'
  | 'USER_BLOCKED'
  | 'USER_INACTIVE'
  | 'EMAIL_JA_CADASTRADO'
  | 'CONFIRMACAO_EMAIL_INVALIDA'
  | 'AVATAR_INVALIDO'
  | 'RESET_SENHA_INVALIDO'
  | 'NOT_IMPLEMENTED'
