import api from './api'

export const privacidadeService = {
  exportarMeusDados() {
    return api.get('/privacidade/meus-dados')
  },

  solicitarExclusao(senha: string) {
    return api.post('/privacidade/solicitar-exclusao', { senha })
  },

  revogarConsentimento() {
    return api.post('/privacidade/revogar-consentimento')
  },
}
