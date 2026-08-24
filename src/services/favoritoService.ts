import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { CriarFavoritoPayload, FavoritoCliente } from '@/types/favorito.types'

export const favoritoService = {
  listar() {
    return api
      .get<ApiSuccessResponse<FavoritoCliente[]>>('/favoritos')
      .then((response) => response.data.data)
  },

  adicionar(payload: CriarFavoritoPayload) {
    return api
      .post<ApiSuccessResponse<FavoritoCliente>>('/favoritos', payload)
      .then((response) => response.data.data)
  },

  remover(id: number) {
    return api.delete(`/favoritos/${id}`)
  },
}
