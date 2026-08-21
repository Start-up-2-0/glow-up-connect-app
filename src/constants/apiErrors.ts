export const API_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
  INVALID_TOKEN: 'Sessão inválida. Faça login novamente.',
  TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente.',
  EMAIL_NAO_CONFIRMADO: 'Confirme seu e-mail antes de entrar.',
  USER_BLOCKED: 'Conta temporariamente bloqueada. Tente mais tarde.',
  USER_INACTIVE: 'Conta inativa. Entre em contato com o suporte.',
  CONTA_EM_EXCLUSAO: 'Esta conta está em exclusão. Você pode reativá-la dentro do prazo de 30 dias.',
  EMAIL_JA_CADASTRADO: 'Este e-mail já está cadastrado.',
  CONFIRMACAO_EMAIL_INVALIDA: 'Código ou link de confirmação inválido.',
  AVATAR_INVALIDO: 'Avatar inválido. Use JPEG, PNG ou WebP. A imagem deve ter até 1 MB após a otimização.',
  RESET_SENHA_INVALIDO: 'Link ou código de redefinição inválido ou expirado.',
  NOT_IMPLEMENTED: 'Funcionalidade ainda não disponível.',
  LOCALIZACAO_CLIENTE_INVALIDA: 'Localização inválida. Verifique as coordenadas ou tente novamente.',
  AGENDAMENTO_NAO_ENCONTRADO: 'Agendamento não encontrado.',
  AGENDAMENTO_STATUS_INVALIDO: 'Esta ação não é permitida para o status atual do agendamento.',
  PROFISSIONAL_EQUIPE_COM_AGENDAMENTO_FUTURO:
    'Este profissional possui agendamentos futuros. Cancele ou reagende antes de remover.',
  ATENDIMENTO_STATUS_INVALIDO: 'Esta ação não é permitida para o status atual do atendimento.',
  HORARIO_INDISPONIVEL: 'Horário indisponível. Escolha outro horário.',
  CONVITE_NEGOCIO_NAO_ENCONTRADO: 'Convite não encontrado ou inválido.',
  CONVITE_NEGOCIO_INVALIDO: 'Convite inválido ou já utilizado.',
  CONVITE_NEGOCIO_INDISPONIVEL:
    'Este convite expirou ou não está mais disponível. Solicite um novo convite ao administrador da loja.',
  CONVITE_NEGOCIO_DUPLICADO: 'Já existe um convite ativo semelhante.',
  CONVITE_USUARIO_NAO_CONFIRMADO:
    'Esta conta ainda não confirmou o e-mail. Peça para confirmar antes de convidar ou vincular.',
  CLIENTE_SEM_ACESSO_NEGOCIO: 'Você não tem acesso a esta área.',
  SUBSCRIPTION_MODULE_BLOCKED: 'Este recurso não está disponível no seu plano atual.',
  INVALID_SUBSCRIPTION_SCOPE: 'Selecione um estabelecimento para continuar.',
  TELEFONE_NAO_CONFIRMADO:
    'Confirme o telefone no WhatsApp antes de concluir a assinatura.',
  TELEFONE_DIVERGENTE_NAO_CONFIRMADO:
    'O telefone informado difere do confirmado na conta. Atualize e confirme no WhatsApp para continuar.',
}

export const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

export function getApiErrorMessage(code?: string, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code]
  }
  return fallback ?? DEFAULT_ERROR_MESSAGE
}
