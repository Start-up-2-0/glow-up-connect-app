export interface WhatsAppConfirmacaoInstrucoes {
  numeroPlataforma: string
  codigoConfirmacao: string
  mensagemSugerida: string
  linkWhatsApp: string
  emailEnviado: boolean
  expiraEm: string
}

export interface WhatsAppOptInPayload {
  optIn: boolean
}
