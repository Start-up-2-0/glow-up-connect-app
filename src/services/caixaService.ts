import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  AtualizarComissaoPayload,
  CaixaResumo,
  ComissaoExtrato,
  ComissaoProfissional,
  ContaPagar,
  ContaReceber,
  CriarComissaoPayload,
  FluxoCaixa,
  LancamentoCaixa,
  LancamentoCaixaFiltro,
  FinanceiroResumo,
  ReceberAgendamentoPayload,
  ReceberAgendamentoResultado,
  RegistrarAjusteCaixaPayload,
  RelatorioAnalitico,
  SessaoCaixa,
} from '@/types/negocio/caixa.types'

export const caixaService = {
  obterResumo(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<CaixaResumo>>(negocioPath(estabelecimentoId, '/caixa'))
      .then(unwrapApi)
  },

  listarLancamentos(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<LancamentoCaixa[]>>(
        negocioPath(estabelecimentoId, '/caixa/lancamentos'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  registrarAjuste(estabelecimentoId: number, payload: RegistrarAjusteCaixaPayload) {
    return api
      .post<ApiSuccessResponse<LancamentoCaixa>>(
        negocioPath(estabelecimentoId, '/caixa/lancamentos'),
        payload,
      )
      .then(unwrapApi)
  },

  estornarLancamento(estabelecimentoId: number, lancamentoId: number, motivo: string) {
    return api
      .post<ApiSuccessResponse<LancamentoCaixa>>(
        negocioPath(estabelecimentoId, `/caixa/lancamentos/${lancamentoId}/estornar`),
        { motivo },
      )
      .then(unwrapApi)
  },

  obterSessaoAtual(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<SessaoCaixa>>(
        negocioPath(estabelecimentoId, '/caixa/sessoes/atual'),
      )
      .then(unwrapApi)
  },

  abrirSessao(estabelecimentoId: number, saldoInicial: number) {
    return api
      .post<ApiSuccessResponse<SessaoCaixa>>(
        negocioPath(estabelecimentoId, '/caixa/sessoes/abrir'),
        { saldoInicial },
      )
      .then(unwrapApi)
  },

  fecharSessao(estabelecimentoId: number, sessaoId: number, saldoInformadoFechamento: number) {
    return api
      .post<ApiSuccessResponse<SessaoCaixa>>(
        negocioPath(estabelecimentoId, `/caixa/sessoes/${sessaoId}/fechar`),
        { saldoInformadoFechamento },
      )
      .then(unwrapApi)
  },

  receberAgendamento(
    estabelecimentoId: number,
    agendamentoId: number,
    payload: ReceberAgendamentoPayload,
  ) {
    return api
      .post<ApiSuccessResponse<ReceberAgendamentoResultado>>(
        negocioPath(estabelecimentoId, `/agendamentos/${agendamentoId}/receber`),
        payload,
      )
      .then(unwrapApi)
  },

  obterFinanceiroResumo(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<FinanceiroResumo>>(
        negocioPath(estabelecimentoId, '/financeiro/resumo'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  listarRelatorioFinanceiro(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<LancamentoCaixa[]>>(
        negocioPath(estabelecimentoId, '/financeiro/relatorios'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  obterRelatorioAnalitico(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<RelatorioAnalitico>>(
        negocioPath(estabelecimentoId, '/financeiro/relatorios/analitico'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  obterFluxoCaixa(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<FluxoCaixa>>(
        negocioPath(estabelecimentoId, '/financeiro/fluxo-caixa'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  exportarRelatorioCsv(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api.get(negocioPath(estabelecimentoId, '/financeiro/relatorios/export'), {
      params: filtro,
      responseType: 'blob',
    })
  },

  listarComissoes(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<ComissaoProfissional[]>>(
        negocioPath(estabelecimentoId, '/financeiro/comissoes'),
      )
      .then(unwrapApi)
  },

  criarComissao(estabelecimentoId: number, payload: CriarComissaoPayload) {
    return api
      .post<ApiSuccessResponse<ComissaoProfissional>>(
        negocioPath(estabelecimentoId, '/financeiro/comissoes'),
        payload,
      )
      .then(unwrapApi)
  },

  atualizarComissao(
    estabelecimentoId: number,
    comissaoId: number,
    payload: AtualizarComissaoPayload,
  ) {
    return api
      .put<ApiSuccessResponse<ComissaoProfissional>>(
        negocioPath(estabelecimentoId, `/financeiro/comissoes/${comissaoId}`),
        payload,
      )
      .then(unwrapApi)
  },

  desativarComissao(estabelecimentoId: number, comissaoId: number) {
    return api.patch(
      negocioPath(estabelecimentoId, `/financeiro/comissoes/${comissaoId}/desativar`),
    )
  },

  listarMinhasComissoes(estabelecimentoId: number, filtro?: LancamentoCaixaFiltro) {
    return api
      .get<ApiSuccessResponse<ComissaoExtrato[]>>(
        negocioPath(estabelecimentoId, '/financeiro/comissoes/minhas'),
        { params: filtro },
      )
      .then(unwrapApi)
  },

  listarContasReceber(estabelecimentoId: number, status?: string) {
    return api
      .get<ApiSuccessResponse<ContaReceber[]>>(
        negocioPath(estabelecimentoId, '/financeiro/contas-receber'),
        { params: { status } },
      )
      .then(unwrapApi)
  },

  criarContaReceber(
    estabelecimentoId: number,
    payload: { descricao: string; valor: number; vencimento: string; agendamentoId?: number },
  ) {
    return api
      .post<ApiSuccessResponse<ContaReceber>>(
        negocioPath(estabelecimentoId, '/financeiro/contas-receber'),
        payload,
      )
      .then(unwrapApi)
  },

  baixarContaReceber(estabelecimentoId: number, contaId: number) {
    return api
      .post<ApiSuccessResponse<ContaReceber>>(
        negocioPath(estabelecimentoId, `/financeiro/contas-receber/${contaId}/baixar`),
        {},
      )
      .then(unwrapApi)
  },

  listarContasPagar(estabelecimentoId: number, status?: string) {
    return api
      .get<ApiSuccessResponse<ContaPagar[]>>(
        negocioPath(estabelecimentoId, '/financeiro/contas-pagar'),
        { params: { status } },
      )
      .then(unwrapApi)
  },

  criarContaPagar(
    estabelecimentoId: number,
    payload: {
      fornecedor: string
      categoria: string
      descricao: string
      valor: number
      vencimento: string
      recorrente: boolean
    },
  ) {
    return api
      .post<ApiSuccessResponse<ContaPagar>>(
        negocioPath(estabelecimentoId, '/financeiro/contas-pagar'),
        payload,
      )
      .then(unwrapApi)
  },

  baixarContaPagar(estabelecimentoId: number, contaId: number) {
    return api
      .post<ApiSuccessResponse<ContaPagar>>(
        negocioPath(estabelecimentoId, `/financeiro/contas-pagar/${contaId}/baixar`),
        {},
      )
      .then(unwrapApi)
  },
}
