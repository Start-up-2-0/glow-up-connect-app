import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AtualizarEstabelecimentoPerfilPayload,
  EstabelecimentoPerfilCompleto,
} from '@/types/estabelecimento.types'
import { negocioPath } from '@/utils/negocioApi'

export const estabelecimentoPerfilService = {
  obterPerfil(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<EstabelecimentoPerfilCompleto>>(negocioPath(estabelecimentoId, '/perfil'))
      .then((response) => response.data.data)
  },

  atualizarPerfil(estabelecimentoId: number, payload: AtualizarEstabelecimentoPerfilPayload) {
    return api
      .put<ApiSuccessResponse<EstabelecimentoPerfilCompleto>>(
        negocioPath(estabelecimentoId, '/perfil'),
        payload,
      )
      .then((response) => response.data.data)
  },
}
