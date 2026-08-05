import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AgendamentoFuturoEquipe,
  AtualizarRoleUsuarioEquipePayload,
  AtualizarStatusProfissionalEquipePayload,
  AtualizarStatusUsuarioEquipePayload,
  AtualizarProfissionalEquipePayload,
  CadastrarUsuarioEquipePayload,
  CancelarAgendamentosFuturosProfissionalEquipePayload,
  CancelarAgendamentosFuturosProfissionalEquipeResult,
  ConvidarProfissionalEquipePayload,
  EquipeMembrosFiltro,
  EquipeMembrosPaginado,
  ProfissionalEquipe,
  UsuarioEquipe,
} from '@/types/negocio/equipe.types'

export const equipeService = {
  listarMembros(estabelecimentoId: number, filtro: EquipeMembrosFiltro = {}) {
    return api
      .get<ApiSuccessResponse<EquipeMembrosPaginado>>(
        negocioPath(estabelecimentoId, '/equipe/membros'),
        {
          params: {
            busca: filtro.busca || undefined,
            cargo: filtro.cargo || undefined,
            status: filtro.status || undefined,
            pagina: filtro.pagina ?? 1,
            tamanhoPagina: filtro.tamanhoPagina ?? 6,
          },
        },
      )
      .then(unwrapApi)
  },

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

  atualizarProfissional(
    estabelecimentoId: number,
    profissionalId: number,
    payload: AtualizarProfissionalEquipePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<ProfissionalEquipe>>(
        negocioPath(estabelecimentoId, `/equipe/profissionais/${profissionalId}`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarRoleUsuario(
    estabelecimentoId: number,
    usuarioId: number,
    payload: AtualizarRoleUsuarioEquipePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<UsuarioEquipe>>(
        negocioPath(estabelecimentoId, `/equipe/usuarios/${usuarioId}/role`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarStatusUsuario(
    estabelecimentoId: number,
    usuarioId: number,
    payload: AtualizarStatusUsuarioEquipePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<UsuarioEquipe>>(
        negocioPath(estabelecimentoId, `/equipe/usuarios/${usuarioId}/status`),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarStatusProfissional(
    estabelecimentoId: number,
    profissionalId: number,
    payload: AtualizarStatusProfissionalEquipePayload,
  ) {
    return api
      .patch<ApiSuccessResponse<ProfissionalEquipe>>(
        negocioPath(estabelecimentoId, `/equipe/profissionais/${profissionalId}/status`),
        payload,
      )
      .then(unwrapApi)
  },

  listarAgendamentosFuturosProfissional(estabelecimentoId: number, profissionalId: number) {
    return api
      .get<ApiSuccessResponse<AgendamentoFuturoEquipe[]>>(
        negocioPath(
          estabelecimentoId,
          `/equipe/profissionais/${profissionalId}/agendamentos-futuros`,
        ),
      )
      .then(unwrapApi)
  },

  cancelarAgendamentosFuturosProfissional(
    estabelecimentoId: number,
    profissionalId: number,
    payload: CancelarAgendamentosFuturosProfissionalEquipePayload,
  ) {
    return api
      .post<ApiSuccessResponse<CancelarAgendamentosFuturosProfissionalEquipeResult>>(
        negocioPath(
          estabelecimentoId,
          `/equipe/profissionais/${profissionalId}/agendamentos-futuros/cancelar`,
        ),
        payload,
      )
      .then(unwrapApi)
  },

  /**
   * Desvincula membro da loja (soft delete: Ativo = false).
   * Preserva histórico de agendamentos no banco.
   */
  async desvincularMembro(
    estabelecimentoId: number,
    opcoes: {
      usuarioId?: number
      profissionalId?: number
      desvincularUsuario?: boolean
      desvincularProfissional?: boolean
      cancelarAgendamentosFuturos?: boolean
      motivoCancelamento?: string
    },
  ) {
    const promises: Promise<unknown>[] = []

    if (opcoes.desvincularUsuario && opcoes.usuarioId != null) {
      promises.push(
        equipeService.atualizarStatusUsuario(estabelecimentoId, opcoes.usuarioId, {
          ativo: false,
        }),
      )
    }

    if (opcoes.desvincularProfissional && opcoes.profissionalId != null) {
      promises.push(
        equipeService.atualizarStatusProfissional(estabelecimentoId, opcoes.profissionalId, {
          ativo: false,
          podeReceberAgendamento: false,
          cancelarAgendamentosFuturos: opcoes.cancelarAgendamentosFuturos,
          motivoCancelamento: opcoes.motivoCancelamento,
        }),
      )
    }

    if (promises.length === 0) {
      throw new Error('Nenhuma operação de desvínculo disponível para este membro.')
    }

    await Promise.all(promises)
  },
}
