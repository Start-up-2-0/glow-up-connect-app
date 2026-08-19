import type { MockRouter, MockRequest } from '../match'
import { ok } from '../response'
import { MOCK_PROFISSIONAIS, MOCK_SERVICOS } from '../seed/catalogo'
import { mockCategoriasEstabelecimento } from '../seed/plataforma'

const PUBLIC_GUID = 'a1b2c3d4e5f6a7b8c9d0e1f2'
const ENDERECO = { logradouro: 'Av. das Acácias, 250', bairro: 'Centro', cidade: 'Aracaju', estado: 'SE' }

/** Marketplace de estabelecimentos — itens com categoria e coordenadas (Aracaju/SE). */
const MARKETPLACE_ITENS = [
  { publicGuid: PUBLIC_GUID, nome: 'Studio Glow Up', logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=96&h=96&fit=crop&auto=format', descricao: 'Salão completo de beleza.', distanciaKm: 0.8, endereco: ENDERECO, destaqueMarketplace: true, notaMedia: 4.8, totalAvaliacoes: 68, categoriaId: 1, categoria: 'Barbearia ou salão de beleza', tipoAssinatura: 'Estabelecimento' as const, latitude: -10.9472, longitude: -37.0731 },
  { publicGuid: 'bbbb-cccc-dddd', nome: 'Zé Cortes', logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=96&h=96&fit=crop&auto=format', descricao: 'Corte e barba sob medida.', distanciaKm: 1.4, endereco: { logradouro: 'Rua da Barba, 12', bairro: 'Centro', cidade: 'Aracaju', estado: 'SE' }, destaqueMarketplace: false, notaMedia: 4.7, totalAvaliacoes: 33, categoriaId: 2, categoria: 'Barbeiro', tipoAssinatura: 'ProfissionalAutonomo' as const, latitude: -10.9518, longitude: -37.0684 },
  { publicGuid: 'eeee-ffff-gggg', nome: 'Cabeleleila Leila', logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=96&h=96&fit=crop&auto=format', descricao: 'Especializada em cabelos.', distanciaKm: 3.1, endereco: { logradouro: 'Av. Central, 500', bairro: 'Centro', cidade: 'Aracaju', estado: 'SE' }, notaMedia: 4.4, totalAvaliacoes: 22, categoriaId: 3, categoria: 'Cabeleireiro(a)', tipoAssinatura: 'ProfissionalAutonomo' as const, latitude: -10.9405, longitude: -37.0812 },
  { publicGuid: 'abcd-1111-2222', nome: 'Nail Studio Prime', logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=96&h=96&fit=crop&auto=format', descricao: 'Esmaltação e design de unhas.', distanciaKm: 4.2, endereco: { logradouro: 'Rua das Unhas, 7', bairro: 'Jardins', cidade: 'Aracaju', estado: 'SE' }, notaMedia: 4.5, totalAvaliacoes: 18, categoriaId: 1, categoria: 'Barbearia ou salão de beleza', tipoAssinatura: 'Estabelecimento' as const, latitude: -10.9589, longitude: -37.0556 },
]

function hoje(plusDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + plusDays)
  return d.toISOString().slice(0, 10)
}

export function registerPublicoRoutes(router: MockRouter) {
  /* ---------- Vitrine (negócio) ---------- */
  router.on('get', '/estabelecimentos/:estabelecimentoId/profissionais/vitrine', () => {
    return ok(
      MOCK_PROFISSIONAIS.map((p) => ({ id: p.id, estabelecimentoId: 1, profissionalId: p.profissionalId, publicGuid: `vit-${p.profissionalId}`, nomePublico: p.nomePublico, biografia: 'Especialista em cabelos e unhas.', logo: '', somenteExibicao: false, ativo: p.ativo })),
    )
  })
  router.on('put', '/estabelecimentos/:estabelecimentoId/profissionais/vitrine', () => {
    return ok({ id: 101, estabelecimentoId: 1, profissionalId: 101, publicGuid: 'vit-101', nomePublico: 'Marina Alves', biografia: 'Especialista.', logo: '', somenteExibicao: false, ativo: true })
  })

  /* ---------- Categorias de estabelecimento ---------- */
  router.on('get', '/publico/estabelecimentos/categorias', (req: MockRequest) => {
    const tipo = req.query.tipoAssinatura
    const categorias = mockCategoriasEstabelecimento()
    return ok(tipo ? categorias.filter((c) => c.tipoAssinatura === tipo) : categorias)
  })

  /* ---------- Estabelecimentos próximos (marketplace) ---------- */
  router.on('get', '/publico/estabelecimentos/proximos', (req: MockRequest) => {
    const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined
    const itens = categoriaId
      ? MARKETPLACE_ITENS.filter((i) => i.categoriaId === categoriaId)
      : MARKETPLACE_ITENS
    return ok({
      cidade: 'Aracaju',
      estado: 'SE',
      raioKm: 10,
      total: itens.length,
      itens,
    })
  })

  router.on('get', '/publico/estabelecimentos/:publicGuid', (req: MockRequest) => {
    const guid = String(req.params.publicGuid ?? '')
    const item = MARKETPLACE_ITENS.find((i) => i.publicGuid === guid) ?? MARKETPLACE_ITENS[0]!
    return ok({
      publicGuid: item.publicGuid,
      nome: item.nome,
      logo: item.logo,
      descricao: item.descricao,
      endereco: item.endereco,
      distanciaKm: item.distanciaKm,
      notaMedia: item.notaMedia ?? 4.5,
      totalAvaliacoes: item.totalAvaliacoes ?? 10,
      abertoAgora: true,
      horarioAbertura: '09:00',
      horarioFechamento: '18:00',
      categoriaId: item.categoriaId,
      categoria: item.categoria,
      tipoAssinatura: item.tipoAssinatura,
    })
  })

  router.on('get', '/publico/agendar/loja/:publicGuid/profissional/:profissionalPublicGuid', () => {
    return ok({
      estabelecimento: { publicGuid: PUBLIC_GUID, nome: 'Studio Glow Up', logo: '', descricao: 'Salão completo.', endereco: ENDERECO, distanciaKm: 0.8 },
      profissional: { publicGuid: 'prof-101', nomePublico: 'Marina Alves' },
      podeReceberAgendamento: true,
    })
  })

  router.on('get', '/publico/agendar/loja/:publicGuid/servicos', () => {
    return ok(
      MOCK_SERVICOS.filter((s) => s.ativo).map((s) => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao,
        precoMinimo: s.precoBase,
        precoMaximo: s.precoBase + 20,
        duracaoMinutosBase: s.duracaoMinutos,
        duracaoMinutosEstimada: s.duracaoMinutos,
      })),
    )
  })

  router.on('get', '/publico/agendar/loja/:publicGuid/profissionais', () => {
    return ok(MOCK_PROFISSIONAIS.filter((p) => p.podeReceberAgendamento).map((p) => ({
      publicGuid: `prof-${p.profissionalId}`,
      nomePublico: p.nomePublico,
      foto: p.foto ?? null,
    })))
  })

  router.on('get', '/publico/estabelecimentos/:publicGuid/profissionais-vitrine', () => {
    return ok(MOCK_PROFISSIONAIS.map((p) => ({ publicGuid: `vit-${p.profissionalId}`, nomePublico: p.nomePublico, biografia: 'Especialista em cabelos e unhas.', logo: '' })))
  })

  router.on('get', '/publico/agendar/loja/:publicGuid/disponibilidade', () => {
    return ok({
      servicoId: 1,
      servicoIds: [1],
      duracaoMinutos: 45,
      mensagemIndisponibilidade: null,
      datasAtendimento: [hoje(1), hoje(2), hoje(3)],
      slots: [
        { profissionalId: 101, inicio: `${hoje(1)}T09:00:00`, fim: `${hoje(1)}T09:45:00` },
        { profissionalId: 101, inicio: `${hoje(1)}T10:00:00`, fim: `${hoje(1)}T10:45:00` },
        { profissionalId: 101, inicio: `${hoje(2)}T09:00:00`, fim: `${hoje(2)}T09:45:00` },
      ],
    })
  })

  router.on('post', '/publico/agendar/loja/:publicGuid', () => {
    return ok({ id: 20, status: 'PendenteConfirmacao', valorTotal: 60, duracaoTotalMinutos: 45, inicio: `${hoje(1)}T09:00:00`, fim: `${hoje(1)}T09:45:00` })
  })
  router.on('post', '/publico/agendar/loja/:publicGuid/com-cadastro', () => {
    return ok({ id: 21, status: 'PendenteConfirmacao', valorTotal: 60, duracaoTotalMinutos: 45, inicio: `${hoje(1)}T10:00:00`, fim: `${hoje(1)}T10:45:00` })
  })

  router.on('get', '/publico/agendar/remarcacao/:token', () => {
    return ok({ id: 1, agendamentoId: 10, status: 'Pendente', dataSugerida: hoje(3), horarioInicioSugerido: '11:00', motivo: 'Ajuste de agenda da loja.', inicioAtual: `${hoje(1)}T09:00:00`, estabelecimentoNome: 'Studio Glow Up', profissionalNome: 'Marina Alves', tokenPublico: 'mock-remarcacao-token', expiraEm: hoje(5) })
  })
  router.on('post', '/publico/agendar/remarcacao/:token/aceitar', () => {
    return ok({ id: 10, status: 'Remarcado', valorTotal: 60, duracaoTotalMinutos: 45, inicio: `${hoje(3)}T11:00:00`, fim: `${hoje(3)}T11:45:00` })
  })
  router.on('post', '/publico/agendar/remarcacao/:token/recusar', () => ok({ ok: true }))
}
