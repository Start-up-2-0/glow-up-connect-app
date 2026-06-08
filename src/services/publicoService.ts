import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ConsultarDisponibilidadeParams,
  DisponibilidadeAgenda,
  ProfissionalPublico,
  ServicoPublico,
} from '@/types/agendamento.types'
import type {
  EstabelecimentoPublico,
  EstabelecimentosProximosResponse,
  ListarProximosParams,
  ObterEstabelecimentoParams,
} from '@/types/estabelecimento.types'
import type { ProfissionalVitrinePublico } from '@/types/negocio/profissionalVitrine.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

export const publicoService = {
  listarProximos(params: ListarProximosParams) {
    return api
      .get<ApiSuccessResponse<EstabelecimentosProximosResponse>>(
        '/publico/estabelecimentos/proximos',
        { params },
      )
      .then(unwrap)
  },

  obterEstabelecimento(publicGuid: string, params?: ObterEstabelecimentoParams) {
    return api
      .get<ApiSuccessResponse<EstabelecimentoPublico>>(
        `/publico/estabelecimentos/${publicGuid}`,
        { params },
      )
      .then(unwrap)
  },

  listarServicosLoja(publicGuid: string, profissionalPublicGuid?: string) {
    return api
      .get<ApiSuccessResponse<ServicoPublico[]>>(
        `/publico/agendar/loja/${publicGuid}/servicos`,
        { params: profissionalPublicGuid ? { profissionalPublicGuid } : undefined },
      )
      .then(unwrap)
  },

  listarProfissionaisLoja(publicGuid: string) {
    return api
      .get<ApiSuccessResponse<ProfissionalPublico[]>>(
        `/publico/agendar/loja/${publicGuid}/profissionais`,
      )
      .then(unwrap)
  },

  listarProfissionaisVitrine(publicGuid: string) {
    return api
      .get<ApiSuccessResponse<ProfissionalVitrinePublico[]>>(
        `/publico/estabelecimentos/${publicGuid}/profissionais-vitrine`,
      )
      .then(unwrap)
  },

  consultarDisponibilidadeLoja(publicGuid: string, params: ConsultarDisponibilidadeParams) {
    return api
      .get<ApiSuccessResponse<DisponibilidadeAgenda>>(
        `/publico/agendar/loja/${publicGuid}/disponibilidade`,
        {
          params: {
            dataInicio: params.dataInicio,
            dataFim: params.dataFim,
            servicoIds: params.servicoIds,
            profissionalId: params.profissionalId,
          },
        },
      )
      .then(unwrap)
  },
}
