import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  CadastrarUsuarioEquipePayload,
  ConvidarProfissionalEquipePayload,
  ProfissionalEquipe,
  UsuarioEquipe,
} from '@/types/negocio/equipe.types'

export const equipeService = {
  listarUsuarios(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<UsuarioEquipe[]>>(negocioPath(estabelecimentoId, '/equipe/usuarios'))
      .then(unwrapApi)
  },

  listarProfissionais(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<ProfissionalEquipe[]>>(
        negocioPath(estabelecimentoId, '/equipe/profissionais'),
      )
      .then(unwrapApi)
  },

  cadastrarUsuario(estabelecimentoId: number, payload: CadastrarUsuarioEquipePayload) {
    return api
      .post<ApiSuccessResponse<UsuarioEquipe>>(
        negocioPath(estabelecimentoId, '/equipe/usuarios'),
        payload,
      )
      .then(unwrapApi)
  },

  /** Vínculo direto — profissional já cadastrado na plataforma. */
  vincularProfissional(estabelecimentoId: number, payload: ConvidarProfissionalEquipePayload) {
    return api
      .post<ApiSuccessResponse<ProfissionalEquipe>>(
        negocioPath(estabelecimentoId, '/equipe/profissionais'),
        payload,
      )
      .then(unwrapApi)
  },
}
