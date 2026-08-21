import api from './api'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AgendamentoContextoPublico,
  AgendamentoCriado,
  ConsultarDisponibilidadeParams,
  CriarAgendamentoComCadastroPayload,
  CriarAgendamentoPublicoPayload,
  DisponibilidadeAgenda,
  ProfissionalPublico,
  PropostaRemarcacao,
  ServicoPublico,
} from '@/types/agendamento.types'
import type {
  EstabelecimentoCategoria,
  EstabelecimentoPublico,
  EstabelecimentosProximosResponse,
  ListarProximosParams,
  ObterEstabelecimentoParams,
} from '@/types/estabelecimento.types'
import type { TipoAssinatura } from '@/types/assinatura.types'
import type { ProfissionalVitrinePublico } from '@/types/negocio/profissionalVitrine.types'

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data
}

/** ASP.NET Core espera servicoIds=1&servicoIds=2, não servicoIds[]=1 (formato padrão do Axios). */
function buildDisponibilidadeQueryParams(params: ConsultarDisponibilidadeParams): URLSearchParams {
  const query = new URLSearchParams()
  query.set('dataInicio', params.dataInicio)
  query.set('dataFim', params.dataFim)
  for (const servicoId of params.servicoIds) {
    query.append('servicoIds', String(servicoId))
  }
  if (params.profissionalId != null) {
    query.set('profissionalId', String(params.profissionalId))
  }
  if (params.profissionalPublicGuid) {
    query.set('profissionalPublicGuid', params.profissionalPublicGuid)
  }
  return query
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

  listarCategorias(tipoAssinatura?: TipoAssinatura) {
    return api
      .get<ApiSuccessResponse<EstabelecimentoCategoria[]>>(
        '/publico/estabelecimentos/categorias',
        { params: tipoAssinatura ? { tipoAssinatura } : undefined },
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

  obterContextoLojaProfissional(publicGuid: string, profissionalPublicGuid: string) {
    return api
      .get<ApiSuccessResponse<AgendamentoContextoPublico>>(
        `/publico/agendar/loja/${publicGuid}/profissional/${profissionalPublicGuid}`,
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
        { params: buildDisponibilidadeQueryParams(params) },
      )
      .then(unwrap)
  },

  criarAgendamentoLoja(publicGuid: string, payload: CriarAgendamentoPublicoPayload) {
    return api
      .post<ApiSuccessResponse<AgendamentoCriado>>(`/publico/agendar/loja/${publicGuid}`, payload)
      .then(unwrap)
  },

  criarAgendamentoComCadastro(publicGuid: string, payload: CriarAgendamentoComCadastroPayload) {
    return api
      .post<ApiSuccessResponse<AgendamentoCriado>>(
        `/publico/agendar/loja/${publicGuid}/com-cadastro`,
        payload,
      )
      .then(unwrap)
  },

  obterPropostaRemarcacao(token: string) {
    return api
      .get<ApiSuccessResponse<PropostaRemarcacao>>(`/publico/agendar/remarcacao/${token}`)
      .then(unwrap)
  },

  aceitarPropostaRemarcacao(token: string) {
    return api
      .post<ApiSuccessResponse<AgendamentoCriado>>(`/publico/agendar/remarcacao/${token}/aceitar`)
      .then(unwrap)
  },

  recusarPropostaRemarcacao(token: string) {
    return api
      .post<ApiSuccessResponse<unknown>>(`/publico/agendar/remarcacao/${token}/recusar`)
      .then(unwrap)
  },
}
