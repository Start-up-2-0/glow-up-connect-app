import type { MockRouter, MockRequest } from '../match'
import { ok, okRaw, voidOk, error } from '../response'
import {
  MOCK_CLIENTE_EMAIL,
  mockEstablishmentsForEmail,
  mockPushExtraEstablishment,
  mockUserForEmail,
} from '../seed/usuario'
import {
  MOCK_ASSINATURA,
  MOCK_COBRANCAS,
  MOCK_DADOS_PRIVACIDADE,
  MOCK_PERFIL_ESTABELECIMENTO,
  MOCK_PLANOS_RESPONSE,
  MOCK_REDE,
} from '../seed/plataforma'

function isoFromNow(hours: number): string {
  const d = new Date(Date.now() + hours * 3600_000)
  return d.toISOString()
}

/** Identidade atual do mock (e-mail de login) — persiste na sessão. */
const SESSION_EMAIL_KEY = 'guc_mock_email'

function currentEmail(): string {
  const v = sessionStorage.getItem(SESSION_EMAIL_KEY)
  return v && v.trim().length ? v : ''
}

function setCurrentEmail(email: string) {
  sessionStorage.setItem(SESSION_EMAIL_KEY, (email ?? '').trim())
}

export function registerCoreRoutes(router: MockRouter) {
  /* ---------- Auth ---------- */
  router.on('post', '/auth/login', (req: MockRequest) => {
    const payload = (req.body ?? {}) as { email?: string }
    const email = payload.email?.trim() ?? ''
    setCurrentEmail(email)
    const user = mockUserForEmail(email)
    return ok({
      token: 'mock-token-abc123',
      refreshToken: 'mock-refresh-xyz789',
      expiresAt: isoFromNow(2),
      refreshExpiresAt: isoFromNow(48),
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        avatarBase64: user.avatarBase64 ?? null,
      },
      requerConfirmacaoEmail: false,
    })
  })
  router.on('post', '/auth/logout', () => {
    sessionStorage.removeItem(SESSION_EMAIL_KEY)
    return voidOk('Logout realizado.')
  })
  router.on('post', '/auth/refresh', () => {
    return ok({
      token: 'mock-token-refreshed',
      refreshToken: 'mock-refresh-refreshed',
      expiresAt: isoFromNow(2),
      refreshExpiresAt: isoFromNow(48),
    })
  })
  router.on('post', '/auth/confirmar-email', () => voidOk('E-mail confirmado.'))
  router.on('post', '/auth/reenviar-confirmacao', () => voidOk('Confirmação reenviada.'))

  /* ---------- Recovery ---------- */
  router.on('post', '/auth/forgot-password', () => voidOk('Código enviado.'))
  router.on('post', '/auth/verify-reset-code', () => voidOk('Código válido.'))
  router.on('post', '/auth/reset-password', () => voidOk('Senha redefinida.'))
  router.on('post', '/auth/resend-reset-code', () => voidOk('Código reenviado.'))

  /* ---------- Usuário ---------- */
  // Cadastro cria uma conta de cliente no mock (role Cliente).
  router.on('post', '/usuario', (req: MockRequest) => {
    const payload = (req.body ?? {}) as { nome?: string; email?: string; telefone?: string; sexo?: string }
    const email = payload.email ?? MOCK_CLIENTE_EMAIL
    setCurrentEmail(email)
    return okRaw({
      id: 99,
      nome: payload.nome ?? 'Cliente Teste',
      email,
      telefone: payload.telefone ?? '',
      role: 1,
      sexo: payload.sexo ?? null,
      ativo: true,
      mensagem: 'Usuário criado com sucesso.',
    })
  })
  router.on('get', '/usuario/me', () => okRaw(mockUserForEmail(currentEmail())))
  router.on('put', '/usuario/me', (req: MockRequest) => {
    // Aplica o patch (nome/telefone/sexo/avatar) ao usuário atual para refletir a edição de perfil.
    const payload = (req.body ?? {}) as {
      nome?: string
      telefone?: string
      sexo?: string
      avatarBase64?: string | null
    }
    const user = { ...mockUserForEmail(currentEmail()) }
    if (payload.nome !== undefined) user.nome = payload.nome
    if (payload.telefone !== undefined) user.telefone = payload.telefone
    if (payload.sexo !== undefined) user.sexo = payload.sexo as 'Masculino' | 'Feminino'
    if (payload.avatarBase64 !== undefined) user.avatarBase64 = payload.avatarBase64
    return okRaw(user)
  })
  router.on('delete', '/usuario/me', () => voidOk('Conta excluída.'))
  router.on('put', '/usuario/me/senha', () => voidOk('Senha alterada.'))
  router.on('get', '/usuario/me/estabelecimentos', () => {
    // Escopo de filiais por identidade/plano (dono por plano; não-dono só a própria).
    return okRaw(mockEstablishmentsForEmail(currentEmail()))
  })
  router.on('post', '/usuario/me/whatsapp/opt-in', () => voidOk('Preferência atualizada.'))

  /* ---------- Planos ---------- */
  router.on('get', '/planos', () => ok(MOCK_PLANOS_RESPONSE))

  /* ---------- Assinatura ---------- */
  router.on('get', '/assinaturas/onboarding/contexto', () => {
    const lojas = mockEstablishmentsForEmail(currentEmail()).filter((e) => e.role === 'Owner')
    const limite = lojas[0]?.limites?.estabelecimentos ?? 1
    const lojasVinculadas = lojas.length
    const podeAdicionarLoja = lojasVinculadas > 0 && limite > 1 && lojasVinculadas < limite
    return ok({
      temEstabelecimentoProprio: lojas.length > 0,
      estabelecimentos: lojas.map((e) => ({
        estabelecimentoId: e.estabelecimentoId,
        nome: e.nome,
        logo: e.logo || null,
        assinaturaAtiva: e.assinaturaAtiva,
        assinaturaPendente: false,
        podeContratar: false,
      })),
      proximaEtapa: podeAdicionarLoja ? 'AdicionarLoja' : 'GerenciarAssinatura',
      estabelecimentoIdSugerido: lojas[0]?.estabelecimentoId ?? null,
      podeAdicionarLoja,
      lojasVinculadas,
      limiteLojas: limite > 1 ? limite : null,
      assinaturaPremiumId: podeAdicionarLoja || limite > 1 ? 1 : null,
    })
  })
  router.on('get', '/assinaturas/atual', () => ok(MOCK_ASSINATURA))
  router.on('get', '/assinaturas/:assinaturaId/cobrancas', () => ok(MOCK_COBRANCAS))
  router.on('post', '/assinaturas', () => ok(MOCK_ASSINATURA))
  router.on('post', '/assinaturas/:assinaturaId/trocar-plano', () => ok(MOCK_ASSINATURA))
  router.on('post', '/assinaturas/:assinaturaId/cancelar', () => ok(MOCK_ASSINATURA))
  router.on('post', '/assinaturas/:assinaturaId/estabelecimentos', (req: MockRequest) => {
    const lojas = mockEstablishmentsForEmail(currentEmail())
    const owner = lojas.find((e) => e.role === 'Owner')
    if (!owner) {
      return error(
        'UsuarioSemPermissaoAssinatura',
        'Apenas o proprietário pode adicionar unidades.',
        403,
      )
    }
    const limite = owner.limites?.estabelecimentos ?? 1
    const vinculadas = lojas.filter((e) => e.role === 'Owner').length
    if (limite <= 1 || vinculadas >= limite) {
      return error(
        'LimiteEstabelecimentosExcedido',
        'Limite de estabelecimentos do plano atingido.',
        400,
      )
    }
    const payload = (req.body ?? {}) as {
      estabelecimento?: { nome?: string; logo?: string }
    }
    const nome = payload.estabelecimento?.nome ?? 'Nova Unidade'
    const nextId = Math.max(0, ...lojas.map((e) => e.estabelecimentoId)) + 1
    const nova = {
      ...owner,
      estabelecimentoId: nextId,
      publicGuid: `mock-guid-${nextId}`,
      nome,
      logo: payload.estabelecimento?.logo ?? '',
    }
    mockPushExtraEstablishment(nova)
    return ok({
      estabelecimentoId: nextId,
      nome,
      assinaturaId: 1,
    })
  })

  /* ---------- Estabelecimento perfil ---------- */
  router.on('get', '/estabelecimentos/:estabelecimentoId/perfil', () => ok(MOCK_PERFIL_ESTABELECIMENTO))
  router.on('put', '/estabelecimentos/:estabelecimentoId/perfil', () => ok(MOCK_PERFIL_ESTABELECIMENTO))

  /* ---------- Rede ---------- */
  router.on('get', '/rede/resumo', () => ok(MOCK_REDE))

  /* ---------- Privacidade ---------- */
  router.on('get', '/privacidade/meus-dados', () => ok(MOCK_DADOS_PRIVACIDADE))
  router.on('post', '/privacidade/solicitar-exclusao', () => voidOk('Exclusão solicitada.'))
  router.on('post', '/privacidade/revogar-consentimento', () => voidOk('Consentimento revogado.'))

  /* ---------- WhatsApp estabelecimento ---------- */
  router.on('post', '/estabelecimentos/:estabelecimentoId/whatsapp/solicitar-confirmacao', () => {
    return ok({ solicitado: true, numero: '(79) 3200-0000' })
  })
  router.on('post', '/estabelecimentos/:estabelecimentoId/whatsapp/opt-in', () => voidOk('Preferência atualizada.'))
}
