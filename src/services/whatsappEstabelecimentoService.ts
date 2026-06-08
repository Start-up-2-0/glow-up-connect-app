import api from './api'
import { negocioPath } from '@/utils/negocioApi'

export const whatsappEstabelecimentoService = {
  solicitarConfirmacao(estabelecimentoId: number) {
    return api.post(negocioPath(estabelecimentoId, '/whatsapp/solicitar-confirmacao'))
  },

  confirmar(estabelecimentoId: number, codigo: string) {
    return api.post(negocioPath(estabelecimentoId, '/whatsapp/confirmar'), { codigo })
  },

  atualizarOptIn(estabelecimentoId: number, optIn: boolean) {
    return api.post(negocioPath(estabelecimentoId, '/whatsapp/opt-in'), { optIn })
  },
}
