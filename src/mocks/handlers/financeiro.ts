import type { MockRouter, MockRequest } from '../match'
import { ok, voidOk } from '../response'
import {
  MOCK_CAIXA_RESUMO,
  MOCK_COMISSAO_METAS,
  MOCK_COMISSOES,
  MOCK_CONCILIACAO,
  MOCK_CONTAS_PAGAR,
  MOCK_CONTAS_RECEBER,
  MOCK_DASHBOARD,
  MOCK_ENTRADAS,
  MOCK_EXTRATO_COMISSOES,
  MOCK_FINANCEIRO_RESUMO,
  MOCK_FLUXO_CAIXA,
  MOCK_LANCAMENTOS_CAIXA,
  MOCK_METAS,
  MOCK_PROGRESSO_METAS,
  MOCK_RELATORIO_ANALITICO,
  MOCK_SAIDAS,
  MOCK_SESSAO_CAIXA,
  concluirMetaComissao,
  mockMetaComissaoDetalhe,
} from '../seed/financeiro'
import type { Meta } from '@/types/negocio/caixa.types'

function paginate<T>(itens: T[]): { total: number; pagina: number; tamanhoPagina: number; itens: T[] } {
  return { total: itens.length, pagina: 1, tamanhoPagina: 50, itens }
}

export function registerFinanceiroRoutes(router: MockRouter) {
  const base = '/estabelecimentos/:estabelecimentoId'

  /* ---------- Caixa ---------- */
  router.on('get', `${base}/caixa`, () => ok(MOCK_CAIXA_RESUMO))
  router.on('get', `${base}/caixa/lancamentos`, () => ok(paginate(MOCK_LANCAMENTOS_CAIXA)))
  router.on('post', `${base}/caixa/lancamentos`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { valor?: number; descricao?: string; subtipo?: string }
    return ok({
      id: 999,
      caixaId: 1,
      agendamentoId: null,
      pagamentoId: null,
      profissionalId: null,
      tipo: body.subtipo ?? 'Entrada',
      valor: body.valor ?? 0,
      descricao: body.descricao ?? 'Ajuste',
      criadoEm: new Date().toISOString(),
    })
  })
  router.on('post', `${base}/caixa/lancamentos/:lancamentoId/estornar`, () => ok(MOCK_LANCAMENTOS_CAIXA[0]))
  router.on('get', `${base}/caixa/sessoes/atual`, () => ok(MOCK_SESSAO_CAIXA))
  router.on('post', `${base}/caixa/sessoes/abrir`, () => ok(MOCK_SESSAO_CAIXA))
  router.on('post', `${base}/caixa/sessoes/:sessaoId/fechar`, () => ok({ ...MOCK_SESSAO_CAIXA, status: 'Fechado', fechadoEm: new Date().toISOString() }))
  router.on('post', `${base}/agendamentos/:agendamentoId/receber`, (req: MockRequest) => {
    return ok({ agendamentoId: Number(reqId(req)), status: 'Realizado', pagamentoId: 1, lancamentoCaixaId: 200, valorRecebido: 60, formaRecebimento: 'Pix', lancamentosComissaoIds: [1] })
  })

  /* ---------- Financeiro resumo/relatorios/fluxo ---------- */
  router.on('get', `${base}/financeiro/resumo`, () => ok(MOCK_FINANCEIRO_RESUMO))
  router.on('get', `${base}/financeiro/relatorios`, () => ok(MOCK_LANCAMENTOS_CAIXA))
  router.on('get', `${base}/financeiro/relatorios/analitico`, () => ok(MOCK_RELATORIO_ANALITICO))
  router.on('get', `${base}/financeiro/fluxo-caixa`, () => ok(MOCK_FLUXO_CAIXA))
  router.on('get', `${base}/financeiro/relatorios/export`, () => {
    return 'data,descricao,valor\n2026-08-01,Corte de Cabelo,60\n2026-08-01,Coloração,200\n'
  })
  router.on('get', `${base}/financeiro/busca`, () => {
    return ok({ lancamentos: MOCK_LANCAMENTOS_CAIXA.slice(0, 2), contasReceber: MOCK_CONTAS_RECEBER, contasPagar: MOCK_CONTAS_PAGAR })
  })

  /* ---------- Conciliação ---------- */
  router.on('get', `${base}/financeiro/conciliacao`, () => ok(MOCK_CONCILIACAO))
  router.on('post', `${base}/financeiro/conciliacao/importar`, () => ok(MOCK_CONCILIACAO))

  /* ---------- Comissões ---------- */
  router.on('get', `${base}/financeiro/comissoes`, () => ok(MOCK_COMISSOES))
  router.on('post', `${base}/financeiro/comissoes`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { profissionalEstabelecimentoId?: number }
    return ok({ ...MOCK_COMISSOES[0], id: 99, profissionalEstabelecimentoId: body.profissionalEstabelecimentoId ?? 101 })
  })
  router.on('put', `${base}/financeiro/comissoes/:comissaoId`, () => ok(MOCK_COMISSOES[0]))
  router.on('patch', `${base}/financeiro/comissoes/:comissaoId/desativar`, () => voidOk('Comissão desativada.'))
  router.on('get', `${base}/financeiro/comissoes/minhas`, () => ok(MOCK_EXTRATO_COMISSOES))

  /* ---------- Contas a receber / pagar ---------- */
  router.on('get', `${base}/financeiro/contas-receber`, () => ok(MOCK_CONTAS_RECEBER))
  router.on('post', `${base}/financeiro/contas-receber`, () => ok(MOCK_CONTAS_RECEBER[0]))
  router.on('post', `${base}/financeiro/contas-receber/:contaId/baixar`, () => ok({ ...MOCK_CONTAS_RECEBER[0], status: 'Recebido' }))
  router.on('patch', `${base}/financeiro/contas-receber/:contaId/cancelar`, () => ok({ ...MOCK_CONTAS_RECEBER[0], status: 'Cancelado' }))
  router.on('get', `${base}/financeiro/contas-pagar`, () => ok(MOCK_CONTAS_PAGAR))
  router.on('post', `${base}/financeiro/contas-pagar`, () => ok(MOCK_CONTAS_PAGAR[0]))
  router.on('post', `${base}/financeiro/contas-pagar/:contaId/baixar`, () => ok({ ...MOCK_CONTAS_PAGAR[0], status: 'Pago' }))
  router.on('patch', `${base}/financeiro/contas-pagar/:contaId/cancelar`, () => ok({ ...MOCK_CONTAS_PAGAR[0], status: 'Cancelado' }))

  /* ---------- Metas (foco atual) ---------- */
  router.on('get', `${base}/financeiro/metas/progresso`, (req: MockRequest) => {
    const metaId = req.query.metaId ? Number(req.query.metaId) : undefined
    if (metaId) return ok(MOCK_PROGRESSO_METAS.filter((p) => Number(p.profissionalEstabelecimentoId) !== metaId))
    return ok(MOCK_PROGRESSO_METAS)
  })
  router.on('get', `${base}/financeiro/metas/comissoes`, () => ok(MOCK_COMISSAO_METAS))
  router.on('get', `${base}/financeiro/metas/comissoes/:metaId`, (req: MockRequest) => {
    return ok(mockMetaComissaoDetalhe(Number(req.params.metaId)))
  })
  router.on('patch', `${base}/financeiro/metas/:metaId/reativar`, () => voidOk('Meta reativada.'))
  router.on('post', `${base}/financeiro/metas/:metaId/concluir`, (req: MockRequest) => {
    const concluida = concluirMetaComissao(Number(req.params.metaId))
    if (!concluida) return null
    return ok(concluida)
  })
  router.on('get', `${base}/financeiro/metas`, () => ok(MOCK_METAS))
  router.on('post', `${base}/financeiro/metas`, (req: MockRequest) => {
    const body = (req.body ?? {}) as Partial<Meta>
    return ok({ ...MOCK_METAS[0], id: 99, nome: body.nome ?? 'Nova Meta', tipoMeta: body.tipoMeta ?? 'Atendimentos' })
  })
  router.on('put', `${base}/financeiro/metas/:metaId`, (req: MockRequest) => {
    const body = (req.body ?? {}) as Partial<Meta>
    return ok({ ...MOCK_METAS[0], id: Number(req.params.metaId), ...body })
  })
  router.on('patch', `${base}/financeiro/metas/:metaId/desativar`, () => voidOk('Meta desativada.'))

  /* ---------- Dashboard financeiro ---------- */
  router.on('get', `${base}/financeiro/dashboard`, () => ok(MOCK_DASHBOARD))

  /* ---------- Entradas / Saídas ---------- */
  router.on('get', `${base}/financeiro/entradas`, () => ok(paginate(MOCK_ENTRADAS)))
  router.on('post', `${base}/financeiro/entradas`, () => ok(MOCK_ENTRADAS[0]))
  router.on('get', `${base}/financeiro/saidas`, () => ok(paginate(MOCK_SAIDAS)))
  router.on('post', `${base}/financeiro/saidas`, () => ok(MOCK_SAIDAS[0]))
  router.on('patch', `${base}/financeiro/entradas/:movimentoId/receber`, () => ok({ ...MOCK_ENTRADAS[0], status: 'recebido' }))
  router.on('patch', `${base}/financeiro/saidas/:movimentoId/pagar`, () => ok({ ...MOCK_SAIDAS[0], status: 'pago' }))
}

// Pega o id de agendamento do corpo ou path (usado no 'receber').
function reqId(req: MockRequest): number {
  return Number(req.params.agendamentoId) || 10
}
