export interface WhatsAppConfirmacaoInstrucoes {
  numeroPlataforma: string
  tokenConfirmacao: string
  linkConfirmacao: string
  linkWhatsApp: string
  whatsAppEnviado: boolean
  emailEnviado: boolean
}

export interface WhatsAppOptInPayload {
  optIn: boolean
}
