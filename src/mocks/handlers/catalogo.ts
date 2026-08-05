import type { MockRouter, MockRequest } from '../match'
import { ok, voidOk } from '../response'
import {
  MOCK_CLIENTES,
  MOCK_HORARIOS_LOJA,
  MOCK_HORARIOS_PROFISSIONAIS,
  MOCK_PROFISSIONAIS,
  MOCK_SERVICOS,
  MOCK_USUARIOS_EQUIPE,
} from '../seed/catalogo'
import { MOCK_AUDITORIA, MOCK_CONVITES, mockConvitePreview } from '../seed/plataforma'
import type { Servico } from '@/types/negocio/servico.types'

export function registerCatalogoRoutes(router: MockRouter) {
  const base = '/estabelecimentos/:estabelecimentoId'

  /* ---------- Equipe: usuários ---------- */
  router.on('get', `${base}/equipe/usuarios`, () => ok(MOCK_USUARIOS_EQUIPE))
  router.on('post', `${base}/equipe/usuarios`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { role?: string }
    return ok({ id: 99, estabelecimentoId: 1, usuarioId: 90, nome: 'Novo Usuário', email: '', telefone: '', role: body.role ?? 'Receptionist', ativo: true })
  })
  router.on('patch', `${base}/equipe/usuarios/:usuarioId/role`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { role?: string }
    return ok({ ...MOCK_USUARIOS_EQUIPE[0], id: Number(req.params.usuarioId), role: body.role ?? 'Manager' })
  })
  router.on('patch', `${base}/equipe/usuarios/:usuarioId/status`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { ativo?: boolean }
    return ok({ ...MOCK_USUARIOS_EQUIPE[0], id: Number(req.params.usuarioId), ativo: body.ativo ?? true })
  })

  /* ---------- Equipe: profissionais ---------- */
  router.on('get', `${base}/equipe/profissionais`, () => ok(MOCK_PROFISSIONAIS))
  router.on('post', `${base}/equipe/profissionais`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { nomePublico?: string }
    return ok({ ...MOCK_PROFISSIONAIS[0], id: 199, profissionalId: 199, nomePublico: body.nomePublico ?? 'Novo Profissional' })
  })
  router.on('patch', `${base}/equipe/profissionais/:profissionalId/status`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { ativo?: boolean; podeReceberAgendamento?: boolean }
    return ok({ ...MOCK_PROFISSIONAIS[0], id: Number(req.params.profissionalId), ativo: body.ativo ?? true, podeReceberAgendamento: body.podeReceberAgendamento ?? true })
  })
  router.on('get', `${base}/equipe/profissionais/:profissionalId/agendamentos-futuros`, () => ok([]))
  router.on('post', `${base}/equipe/profissionais/:profissionalId/agendamentos-futuros/cancelar`, () => ok({ quantidadeCancelada: 0 }))

  /* ---------- Convites ---------- */
  router.on('post', `${base}/convites/profissionais`, () => ok({ tipoResultado: 'Convite', linkConvite: 'https://glowupconnect.com.br/c/mock-token', convite: MOCK_CONVITES[0] }))
  router.on('post', `${base}/convites/usuarios`, () => ok({ tipoResultado: 'Convite', linkConvite: 'https://glowupconnect.com.br/c/mock-token', convite: MOCK_CONVITES[1] }))
  router.on('get', `${base}/convites`, () => ok(MOCK_CONVITES))
  router.on('delete', `${base}/convites/:conviteId`, () => ok(MOCK_CONVITES[0]))
  router.on('get', '/convites/:token/preview', (req: MockRequest) => ok(mockConvitePreview(req.params.token)))
  router.on('post', '/convites/:token/aceitar', () => ok(MOCK_CONVITES[1]))
  router.on('post', '/convites/:token/rejeitar', () => ok(MOCK_CONVITES[0]))

  /* ---------- Serviços ---------- */
  router.on('get', `${base}/servicos`, (req: MockRequest) => {
    const ativo = req.query.ativo === 'true'
    const lista = ativo ? MOCK_SERVICOS.filter((s) => s.ativo) : MOCK_SERVICOS
    return ok(lista)
  })
  router.on('post', `${base}/servicos`, (req: MockRequest) => {
    const body = (req.body ?? {}) as Partial<Servico>
    return ok({ ...MOCK_SERVICOS[0], id: 99, nome: body.nome ?? 'Novo Serviço', precoBase: body.precoBase ?? 0, duracaoMinutos: body.duracaoMinutos ?? 30, profissionais: [] })
  })
  router.on('put', `${base}/servicos/:servicoId`, (req: MockRequest) => {
    const body = (req.body ?? {}) as Partial<Servico>
    return ok({ ...MOCK_SERVICOS[0], id: Number(req.params.servicoId), ...body })
  })
  router.on('patch', `${base}/servicos/:servicoId/status`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { ativo?: boolean }
    return ok({ ...MOCK_SERVICOS[0], id: Number(req.params.servicoId), ativo: body.ativo ?? true })
  })
  router.on('post', `${base}/servicos/:servicoId/profissionais/:profissionalId`, () => {
    return ok({ id: 1, profissionalId: Number(0), servicoId: 1, preco: 0, duracaoMinutos: 0, ativo: true })
  })
  router.on('put', `${base}/servicos/:servicoId/profissionais/:profissionalId`, () => {
    return ok({ id: 1, profissionalId: Number(0), servicoId: 1, preco: 0, duracaoMinutos: 0, ativo: true })
  })
  router.on('patch', `${base}/servicos/:servicoId/profissionais/:profissionalId/status`, () => {
    return ok({ id: 1, profissionalId: Number(0), servicoId: 1, preco: 0, duracaoMinutos: 0, ativo: false })
  })

  /* ---------- Clientes ---------- */
  router.on('get', `${base}/clientes`, () => ok(MOCK_CLIENTES))

  /* ---------- Horários ---------- */
  router.on('get', `${base}/horarios-funcionamento`, () => ok(MOCK_HORARIOS_LOJA))
  router.on('put', `${base}/horarios-funcionamento`, (req: MockRequest) => ok(req.body ?? MOCK_HORARIOS_LOJA))
  router.on('get', `${base}/profissionais/horarios`, () => ok(MOCK_HORARIOS_PROFISSIONAIS))
  router.on('put', `${base}/profissionais/horarios`, (req: MockRequest) => ok(req.body ?? MOCK_HORARIOS_PROFISSIONAIS))

  /* ---------- Auditoria ---------- */
  router.on('get', `${base}/auditoria`, () => ok(MOCK_AUDITORIA))
}

// Helper de retorno vazio-wrapped para rotas que usam voidOk silencioso.
export function okVoid() {
  return voidOk('ok')
}