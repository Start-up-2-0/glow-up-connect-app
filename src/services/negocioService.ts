import api from './api'
import type { EstabelecimentoAcesso } from '@/types/user.types'

export const negocioService = {
  listarEstabelecimentos() {
    return api.get<EstabelecimentoAcesso[]>('/usuario/me/estabelecimentos').then((response) => response.data)
  },
}
