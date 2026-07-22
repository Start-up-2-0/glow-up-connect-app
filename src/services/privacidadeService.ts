import api from './api'

export const privacidadeService = {
  exportarMeusDados() {
    return api.get('/privacidade/meus-dados')
  },

  solicitarExclusao() {
    return api.post('/privacidade/solicitar-exclusao')
  },

  revogarConsentimento() {
    return api.post('/privacidade/revogar-consentimento')
  },
}
