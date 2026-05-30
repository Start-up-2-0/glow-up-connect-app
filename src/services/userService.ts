import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  CadastroPayload,
  CadastroResponse,
  EstabelecimentoAcesso,
  UpdateProfilePayload,
  User,
} from '@/types/user.types'

export const userService = {
  cadastrar(payload: CadastroPayload) {
    return api.post<CadastroResponse>('/usuario', payload)
  },

  me() {
    return api.get<User>('/usuario/me')
  },

  updateMe(payload: UpdateProfilePayload) {
    return api.put('/usuario/me', payload)
  },

  meEstabelecimentos() {
    return api.get<EstabelecimentoAcesso[]>('/usuario/me/estabelecimentos')
  },
}

export type { ApiSuccessResponse }
