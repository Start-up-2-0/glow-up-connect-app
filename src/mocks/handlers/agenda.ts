import type { MockRouter } from '../match'
import { ok, voidOk } from '../response'
import {
  MOCK_AGENDA_GERAL,
  MOCK_AGENDA_PROPRIA,
  MOCK_AGENDAMENTOS_ME,
  MOCK_AVALIACAO_RESUMO,
  MOCK_AVALIACOES_NEGOCIO,
} from '../seed/agenda'

export function registerAgendaRoutes(router: MockRouter) {
  const base = '/estabelecimentos/:estabelecimentoId'

  /* ---------- Agenda (negócio) ---------- */
  router.on('get', `${base}/agenda`, () => ok({ total: MOCK_AGENDA_GERAL.length, pagina: 1, tamanhoPagina: 50, itens: MOCK_AGENDA_GERAL }))
  router.on('get', `${base}/agenda/propria`, () => ok({ total: MOCK_AGENDA_PROPRIA.length, pagina: 1, tamanhoPagina: 50, itens: MOCK_AGENDA_PROPRIA }))
  router.on('get', `${base}/agendamentos/:agendamentoId`, () => ok(MOCK_AGENDA_GERAL[0]))
  router.on('get', `${base}/agendamentos/:agendamentoId/historico`, () => {
    return ok([
      { id: 1, usuarioExecutorId: 1, usuarioExecutorNome: 'Gustavo Souza', statusAnterior: 'Agendado', statusNovo: 'Confirmado', motivo: null, criadoEm: new Date().toISOString() },
    ])
  })
  router.on('post', `${base}/agendamentos/:agendamentoId/confirmar`, () => voidOk('Agendamento confirmado.'))
  router.on('post', `${base}/agendamentos/:agendamentoId/cancelar`, () => voidOk('Agendamento cancelado.'))
  router.on('post', `${base}/agendamentos/:agendamentoId/sugerir-remarcacao`, () => voidOk('Sugestão enviada.'))
  router.on('post', `${base}/atendimentos/:agendamentoItemId/iniciar`, () => voidOk('Atendimento iniciado.'))
  router.on('post', `${base}/atendimentos/:agendamentoItemId/finalizar`, () => voidOk('Atendimento finalizado.'))

  /* ---------- Agendamentos (cliente) ---------- */
  router.on('post', '/agendamentos', () => ok(MOCK_AGENDAMENTOS_ME[1]))
  router.on('get', '/agendamentos/me', () => ok({ total: MOCK_AGENDAMENTOS_ME.length, pagina: 1, tamanhoPagina: 50, itens: MOCK_AGENDAMENTOS_ME }))
  router.on('get', '/agendamentos/me/:id', () => ok(MOCK_AGENDAMENTOS_ME[0]))
  router.on('post', '/agendamentos/me/:id/cancelar', () => ok({ ...MOCK_AGENDAMENTOS_ME[0], status: 'Cancelado', canceladoEm: new Date().toISOString() }))
  router.on('post', '/agendamentos/me/:id/remarcar', () => ok(MOCK_AGENDAMENTOS_ME[1]))
  router.on('post', '/agendamentos/me/:agendamentoId/propostas-remarcacao/:propostaId/aceitar', () => ok(MOCK_AGENDAMENTOS_ME[1]))

  /* ---------- Avaliações (negócio) ---------- */
  router.on('get', `${base}/avaliacoes/resumo`, () => ok(MOCK_AVALIACAO_RESUMO))
  router.on('get', `${base}/avaliacoes`, () => ok({ resumo: MOCK_AVALIACAO_RESUMO, total: MOCK_AVALIACOES_NEGOCIO.length, pagina: 1, tamanhoPagina: 10, itens: MOCK_AVALIACOES_NEGOCIO }))

  /* ---------- Avaliações (cliente / público) ---------- */
  router.on('get', '/agendamentos/me/:id/avaliacao', () => {
    return ok({
      status: 'Pendente',
      agendamentoId: 10,
      estabelecimentoPublicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2',
      estabelecimentoNome: 'Studio Glow Up',
      estabelecimentoLogo: '',
      profissionalId: 101,
      profissionalNome: 'Marina Alves',
      profissionalLogo: '',
      atendimentoInicio: new Date().toISOString(),
      atendimentoFim: new Date().toISOString(),
      avaliacao: null,
    })
  })
  router.on('post', '/agendamentos/me/:id/avaliacao', () => {
    return ok({ status: 'Realizada', agendamentoId: 10, estabelecimentoPublicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2', estabelecimentoNome: 'Studio Glow Up', estabelecimentoLogo: '', profissionalId: 101, profissionalNome: 'Marina Alves', profissionalLogo: '', atendimentoInicio: new Date().toISOString(), atendimentoFim: new Date().toISOString(), avaliacao: { notaEstabelecimento: 5, notaProfissional: 5, avaliadoEm: new Date().toISOString() } })
  })
  router.on('get', '/publico/avaliacoes/:token', () => ok({ status: 'Pendente', agendamentoId: 10, estabelecimentoPublicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2', estabelecimentoNome: 'Studio Glow Up', estabelecimentoLogo: '', profissionalId: 101, profissionalNome: 'Marina Alves', profissionalLogo: '', atendimentoInicio: new Date().toISOString(), atendimentoFim: new Date().toISOString(), avaliacao: null }))
  router.on('post', '/publico/avaliacoes/:token', () => ok({ status: 'Realizada', agendamentoId: 10, estabelecimentoPublicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2', estabelecimentoNome: 'Studio Glow Up', estabelecimentoLogo: '', profissionalId: 101, profissionalNome: 'Marina Alves', profissionalLogo: '', atendimentoInicio: new Date().toISOString(), atendimentoFim: new Date().toISOString(), avaliacao: { notaEstabelecimento: 5, notaProfissional: 5, avaliadoEm: new Date().toISOString() } }))
  router.on('get', '/publico/avaliacoes/estabelecimentos/:publicGuid', () => {
    return ok({ resumo: MOCK_AVALIACAO_RESUMO, total: 3, pagina: 1, tamanhoPagina: 10, itens: [{ nota: 5, comentario: 'Excelente atendimento!', avaliadoEm: new Date().toISOString(), clienteNome: 'Ana Paula' }] })
  })
}