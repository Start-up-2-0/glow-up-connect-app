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
  LOCALIZACAO_CLIENTE_INVALIDA: 'Localização inválida. Verifique as coordenadas ou tente novamente.',
  AGENDAMENTO_NAO_ENCONTRADO: 'Agendamento não encontrado.',
  AGENDAMENTO_STATUS_INVALIDO: 'Esta ação não é permitida para o status atual do agendamento.',
  HORARIO_INDISPONIVEL: 'Horário indisponível. Escolha outro horário.',
  CONVITE_NEGOCIO_NAO_ENCONTRADO: 'Convite não encontrado ou inválido.',
  CONVITE_NEGOCIO_INVALIDO: 'Convite expirado, já respondido ou destinado a outro e-mail.',
  CONVITE_NEGOCIO_DUPLICADO: 'Já existe um convite pendente para este e-mail.',
  CLIENTE_SEM_ACESSO_NEGOCIO: 'Você não tem acesso a esta área.',
  SUBSCRIPTION_MODULE_BLOCKED: 'Este recurso não está disponível no seu plano atual.',
  INVALID_SUBSCRIPTION_SCOPE: 'Selecione um estabelecimento para continuar.',
}

export const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

export function getApiErrorMessage(code?: string, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code]
  }
  return fallback ?? DEFAULT_ERROR_MESSAGE
}
