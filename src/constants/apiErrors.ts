export const API_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  INVALID_CREDENTIALS: 'Email ou senha inválidos.',
  INVALID_TOKEN: 'Sessão inválida. Faça login novamente.',
  TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente.',
  EMAIL_NAO_CONFIRMADO: 'Confirme seu e-mail antes de entrar.',
  USER_BLOCKED: 'Conta temporariamente bloqueada. Tente mais tarde.',
  USER_INACTIVE: 'Conta inativa. Entre em contato com o suporte.',
  EMAIL_JA_CADASTRADO: 'Este e-mail já está cadastrado.',
  CONFIRMACAO_EMAIL_INVALIDA: 'Código ou link de confirmação inválido.',
  AVATAR_INVALIDO: 'Avatar inválido. Use JPEG, PNG ou WebP com até 5 MB.',
  RESET_SENHA_INVALIDO: 'Link ou token de redefinição inválido ou expirado.',
  RESET_CODIGO_INVALIDO: 'Código de verificação inválido ou expirado.',
  NOT_IMPLEMENTED: 'Funcionalidade ainda não disponível.',
}

export const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

export function getApiErrorMessage(code?: string, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code]
  }
  return fallback ?? DEFAULT_ERROR_MESSAGE
}
