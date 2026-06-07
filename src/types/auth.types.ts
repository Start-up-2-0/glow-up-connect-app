import type { UserSummary } from './user.types'
import type { ApiSuccessResponse } from './api.types'

export interface LoginPayload {
  email: string
  senha: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
}

export interface LoginData extends AuthTokens {
  usuario: UserSummary
  requerConfirmacaoEmail?: boolean
}

export interface RefreshPayload {
  refreshToken: string
}

export interface ConfirmarEmailPayload {
  codigo?: string
  token?: string
}

export interface ReenviarConfirmacaoPayload {
  email: string
}

export type StoredSession = AuthTokens

export type LoginResponse = ApiSuccessResponse<LoginData>

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyResetCodeRequest {
  email: string
  codigo: string
}

export interface ResetPasswordRequest {
  email: string
  senha: string
  confirmarSenha: string
}

export interface ResendResetCodeRequest {
  email: string
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'EMAIL_NAO_CONFIRMADO'
  | 'USER_BLOCKED'
  | 'USER_INACTIVE'
  | 'EMAIL_JA_CADASTRADO'
  | 'CONFIRMACAO_EMAIL_INVALIDA'
  | 'AVATAR_INVALIDO'
  | 'RESET_SENHA_INVALIDO'
  | 'RESET_CODIGO_INVALIDO'
  | 'NOT_IMPLEMENTED'
