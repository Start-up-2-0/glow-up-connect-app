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

  /* ---------- Equipe: membros (paginado) ---------- */
  router.on('get', `${base}/equipe/membros`, (req: MockRequest) => {
    const pagina = Number(req.query?.pagina ?? 1) || 1
    const tamanhoPagina = Number(req.query?.tamanhoPagina ?? 6) || 6
    const busca = String(req.query?.busca ?? '').trim().toLowerCase()
    const cargo = String(req.query?.cargo ?? '').trim()
    const status = String(req.query?.status ?? '').trim().toLowerCase()

    const membros = [
      ...MOCK_USUARIOS_EQUIPE.map((u) => {
        const prof = MOCK_PROFISSIONAIS.find((p) => p.usuarioId === u.usuarioId)
        return {
          id: `usuario-${u.id}`,
          tipo: 'usuario' as const,
          nome: u.nome,
          cargo: u.role === 'Owner' ? 'Dono' : u.role === 'Admin' ? 'Administrador' : u.role === 'Receptionist' ? 'Recepcionista' : u.role,
          role: u.role,
          email: u.email,
          telefone: u.telefone,
          ativo: u.ativo,
          usuarioId: u.usuarioId,
          profissionalId: prof?.profissionalId ?? null,
          podeReceberAgendamento: prof?.podeReceberAgendamento ?? null,
          foto: prof?.foto ?? null,
          conviteEm: null,
        }
      }),
      ...MOCK_PROFISSIONAIS
        .filter((p) => !MOCK_USUARIOS_EQUIPE.some((u) => u.usuarioId === p.usuarioId))
        .map((p) => ({
          id: `profissional-${p.id}`,
          tipo: 'profissional' as const,
          nome: p.nomePublico,
          cargo: 'Profissional',
          role: 'Profissional',
          email: p.email,
          telefone: p.telefone,
          ativo: p.ativo,
          usuarioId: p.usuarioId,
          profissionalId: p.profissionalId,
          podeReceberAgendamento: p.podeReceberAgendamento,
          foto: p.foto ?? null,
          conviteEm: null,
        })),
      ...MOCK_CONVITES
        .filter((c) => c.status === 'Pendente')
        .map((c) => ({
          id: `convite-${c.id}`,
          tipo: 'convite' as const,
          nome: c.email.split('@')[0] || c.email,
          cargo: 'Convidado',
          role: 'Convidado',
          email: c.email,
          telefone: null as string | null,
          ativo: false,
          usuarioId: null as number | null,
          profissionalId: null as number | null,
          podeReceberAgendamento: null as boolean | null,
          foto: null as string | null,
          conviteEm: '05/08/2026',
        })),
    ]

    const filtrados = membros.filter((m) => {
      if (cargo && m.role !== cargo) return false
      if (status) {
        const s = m.tipo === 'convite' ? 'pendente' : m.ativo ? 'ativo' : 'inativo'
        if (s !== status) return false
      }
      if (busca) {
        const hay = [m.nome, m.cargo, m.email ?? ''].join(' ').toLowerCase()
        if (!hay.includes(busca)) return false
      }
      return true
    })

    const start = (pagina - 1) * tamanhoPagina
    const itens = filtrados.slice(start, start + tamanhoPagina)
    return ok({
      total: filtrados.length,
      pagina,
      tamanhoPagina,
      itens,
      resumo: {
        totalMembros: membros.filter((m) => m.tipo !== 'convite' && m.ativo).length,
        administradores: membros.filter((m) => m.ativo && (m.role === 'Owner' || m.role === 'Admin')).length,
        profissionais: membros.filter((m) => m.ativo && m.role === 'Profissional').length,
        recepcionistas: membros.filter((m) => m.ativo && m.role === 'Receptionist').length,
        convidados: MOCK_CONVITES.filter((c) => c.status === 'Pendente').length,
      },
    })
  })

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
  router.on('patch', `${base}/equipe/profissionais/:profissionalId`, (req: MockRequest) => {
    const body = (req.body ?? {}) as {
      nomePublico?: string
      foto?: string | null
      removerFoto?: boolean
    }
    const baseProf = MOCK_PROFISSIONAIS.find((p) => p.profissionalId === Number(req.params.profissionalId))
      ?? MOCK_PROFISSIONAIS[0]!
    return ok({
      ...baseProf,
      nomePublico: body.nomePublico ?? baseProf.nomePublico,
      foto: body.removerFoto ? null : (body.foto ?? baseProf.foto ?? null),
    })
  })
  router.on('get', `${base}/equipe/profissionais/:profissionalId/agendamentos-futuros`, () => ok([]))
  router.on('post', `${base}/equipe/profissionais/:profissionalId/agendamentos-futuros/cancelar`, () => ok({ quantidadeCancelada: 0 }))

  /* ---------- Convites ---------- */
  router.on('post', `${base}/convites`, () =>
    ok({
      ...MOCK_CONVITES[0],
      linkConvite: 'https://glowupconnect.com.br/convite/11111111-1111-1111-1111-111111111111',
    }),
  )
  router.on('get', `${base}/convites`, () => ok(MOCK_CONVITES))
  router.on('delete', `${base}/convites/:conviteId`, () => ok(MOCK_CONVITES[0]))
  router.on('get', '/publico/convites/:token/preview', (req: MockRequest) =>
    ok(mockConvitePreview(req.params.token)),
  )
  router.on('post', '/publico/convites/:token/aceitar', () => ok(MOCK_CONVITES[0]))
  router.on('post', '/publico/convites/:token/aceitar-com-cadastro', () => ok(MOCK_CONVITES[0]))

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
  router.on('post', `${base}/horarios-funcionamento`, (req: MockRequest) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    return ok({
      id: Date.now(),
      estabelecimentoId: Number(req.params?.estabelecimentoId ?? 1),
      ...body,
      ativo: body.ativo ?? true,
    })
  })
  router.on('put', `${base}/horarios-funcionamento/:horarioId`, (req: MockRequest) => {
    return ok({ id: Number(req.params?.horarioId ?? 1), ...(req.body as object) })
  })
  router.on('patch', `${base}/horarios-funcionamento/:horarioId/status`, (req: MockRequest) => {
    const body = (req.body ?? {}) as { ativo?: boolean }
    return ok({
      id: Number(req.params?.horarioId ?? 1),
      ativo: body.ativo ?? true,
    })
  })
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