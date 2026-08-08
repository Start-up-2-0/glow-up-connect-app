import type { EstabelecimentoAcesso, User, UserRole } from '@/types/user.types'

export const MOCK_USER: User = {
  id: 1,
  nome: 'Gustavo Souza',
  email: 'gustavo@glowup.com.br',
  telefone: '(79) 99999-1763',
  role: 2, // DONO_ESTABELECIMENTO
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Masculino',
  createdAt: '2026-01-10T09:00:00Z',
  updatedAt: '2026-07-20T12:00:00Z',
}

/** Cliente final do mock — role 1. Use o e-mail abaixo no login p/ ver a visão de cliente. */
export const MOCK_CLIENTE_EMAIL = 'cliente@teste.com'

export const MOCK_CLIENTE: User = {
  id: 50,
  nome: 'Cliente Teste',
  email: MOCK_CLIENTE_EMAIL,
  telefone: '(79) 99999-0000',
  role: 1, // CLIENTE
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Feminino',
  createdAt: '2026-06-01T09:00:00Z',
  updatedAt: null,
}

/* ---------- Perfis por role (validação de telas) ---------- */

export const MOCK_PROFISSIONAL: User = {
  id: 70,
  nome: 'Carlos Profissional',
  email: 'profissional@teste.com',
  telefone: '(79) 99999-2222',
  role: 4, // PROFISSIONAL_ESTABELECIMENTO
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  createdAt: '2026-04-01T09:00:00Z',
  updatedAt: null,
}

/**
 * Administrador da loja — role global 5 + EstablishmentUserRole Admin.
 * Login: admin@teste.com (qualquer senha no mock).
 * Escopo: apenas a filial onde foi cadastrado (Studio Glow Up).
 * Permissões: iguais ao Dono na operação da loja (ver PERMS_ADMIN).
 */
export const MOCK_ADMIN: User = {
  id: 80,
  nome: 'Roberto Admin',
  email: 'admin@teste.com',
  telefone: '(79) 99999-3333',
  role: 5, // ADMIN
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Masculino',
  createdAt: '2026-03-01T09:00:00Z',
  updatedAt: null,
}

/** Dono com plano Plus/Essencial (sem multi-filial) — validar escopo de plano. */
export const MOCK_DONO_PLUS: User = {
  id: 81,
  nome: 'Mariana Plus',
  email: 'plus@teste.com',
  telefone: '(79) 99999-4444',
  role: 2,
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  createdAt: '2026-02-01T09:00:00Z',
  updatedAt: null,
}

/** Dono com plano Básico (apenas loja principal). */
export const MOCK_DONO_BASICO: User = {
  id: 82,
  nome: 'Paulo Básico',
  email: 'basico@teste.com',
  telefone: '(79) 99999-5555',
  role: 2,
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  createdAt: '2026-02-01T09:00:00Z',
  updatedAt: null,
}

/**
 * Profissional autônomo · Essencial — role 3.
 * Login: autonomo.essencial@teste.com (qualquer senha no mock).
 * Módulos: agenda, serviços, horários, clientes, e-mail — sem WhatsApp/caixa/financeiro.
 * Sem equipe, comissões nem multi-loja.
 */
export const MOCK_AUTONOMO_ESSENCIAL: User = {
  id: 90,
  nome: 'Ana Autônoma Essencial',
  email: 'autonomo.essencial@teste.com',
  telefone: '(79) 98888-1001',
  role: 3, // PROFISSIONAL_AUTONOMO
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: false,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Feminino',
  createdAt: '2026-05-01T09:00:00Z',
  updatedAt: null,
}

/**
 * Profissional autônomo · Premium — role 3.
 * Login: autonomo.premium@teste.com (qualquer senha no mock).
 * Módulos do Essencial + WhatsApp, Caixa e Financeiro.
 * Sem equipe, comissões nem multi-loja (limites = 1).
 */
export const MOCK_AUTONOMO_PREMIUM: User = {
  id: 91,
  nome: 'Bruno Autônomo Premium',
  email: 'autonomo.premium@teste.com',
  telefone: '(79) 98888-2002',
  role: 3, // PROFISSIONAL_AUTONOMO
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Masculino',
  createdAt: '2026-05-01T09:00:00Z',
  updatedAt: null,
}

/**
 * Recepcionista — role global 5 + EstablishmentUserRole Receptionist.
 * Login: recepcionista@teste.com (qualquer senha no mock).
 * Escopo: apenas a filial onde foi cadastrado (Studio Glow Up).
 * Foco: agenda geral, clientes e atendimento — sem caixa, equipe nem config da loja.
 */
export const MOCK_RECEPCIONISTA: User = {
  id: 83,
  nome: 'Fernanda Recepção',
  email: 'recepcionista@teste.com',
  telefone: '(79) 99999-6666',
  role: 5,
  ativo: true,
  whatsAppConfirmado: true,
  whatsAppOptIn: true,
  whatsAppPendenteConfirmacao: false,
  sexo: 'Feminino',
  createdAt: '2026-02-01T09:00:00Z',
  updatedAt: null,
}

/** E-mails de acesso do mock por role (use no login p/ simular cada perfil). */
export const MOCK_PROFILE_EMAILS: Partial<Record<UserRole, string>> = {
  1: MOCK_CLIENTE_EMAIL,
  2: MOCK_USER.email,
  3: MOCK_AUTONOMO_PREMIUM.email,
  4: MOCK_PROFISSIONAL.email,
  5: MOCK_ADMIN.email,
}

const PROFILE_USERS: Partial<Record<UserRole, User>> = {
  1: MOCK_CLIENTE,
  2: MOCK_USER,
  3: MOCK_AUTONOMO_PREMIUM,
  4: MOCK_PROFISSIONAL,
  5: MOCK_ADMIN,
}

export function mockUserForProfile(role: UserRole): User {
  return PROFILE_USERS[role] ?? MOCK_USER
}

/** Todos os módulos do sistema, conforme navigation.ts / moduloLabels.ts. */
export const APP_MODULES = [
  'Estabelecimento',
  'Assinatura',
  'Agenda',
  'Servicos',
  'HorariosAtendimento',
  'Notificacoes',
  'Email',
  'Profissionais',
  'WhatsApp',
  'Caixa',
  'Financeiro',
  'ComissaoProfissionais',
  'Clientes',
] as const

/**
 * Matriz alinhada a `MatrizPermissaoNegocioService` (API).
 * Owner/Admin: operação completa da loja + caixa + config.
 */
export const APP_PERMISSOES = [
  'NegocioVisualizar',
  'NegocioEditar',
  'EquipeVisualizar',
  'EquipeGerenciar',
  'ProfissionalConvidar',
  'ProfissionalGerenciar',
  'ServicoVisualizar',
  'ServicoGerenciar',
  'HorarioVisualizar',
  'HorarioGerenciar',
  'AgendaVisualizarGeral',
  'AgendaCriar',
  'AgendaReagendar',
  'AgendaCancelar',
  'AtendimentoIniciar',
  'AtendimentoFinalizar',
  'ClienteVisualizarGeral',
  'CaixaVisualizar',
  'CaixaGerenciar',
  'MetaGerenciar',
] as const

/** Admin = mesmas permissões do Owner na loja (sem multi-filial). */
export const PERMS_ADMIN = [...APP_PERMISSOES] as const

/**
 * Recepcionista — agenda/clientes/atendimento; sem financeiro, equipe nem edição do negócio.
 * Espelha `PermissoesReceptionist` da API.
 */
export const PERMS_RECEPCIONISTA = [
  'NegocioVisualizar',
  'ServicoVisualizar',
  'HorarioVisualizar',
  'AgendaVisualizarGeral',
  'AgendaCriar',
  'AgendaReagendar',
  'AgendaCancelar',
  'AtendimentoIniciar',
  'AtendimentoFinalizar',
  'ClienteVisualizarGeral',
] as const

/** Permissões de um profissional de estabelecimento (vê a própria agenda). */
const PERMS_PROFISSIONAL = [
  'NegocioVisualizar',
  'ServicoVisualizar',
  'HorarioVisualizar',
  'HorarioGerenciarProprio',
  'AgendaVisualizarPropria',
  'AtendimentoVisualizarProprio',
  'AtendimentoIniciar',
  'AtendimentoFinalizar',
  'ClienteVisualizarProprio',
  'ComissaoVisualizarPropria',
] as const

export interface PlanoMock {
  id: number
  nome: string
  limiteEstabelecimentos: number
  prioridade: boolean
}

/** Planos do mock — controle de acesso a filiais / módulos. */
export const PLANO_PREMIUM: PlanoMock = { id: 3, nome: 'Premium', limiteEstabelecimentos: 5, prioridade: true }
/** Alias legado do plano intermediário de loja (mesmo id do Essencial). */
export const PLANO_PLUS: PlanoMock = { id: 2, nome: 'Essencial', limiteEstabelecimentos: 1, prioridade: false }
/** Catálogo comercial atual (loja/autônomo) — id 2. */
export const PLANO_ESSENCIAL: PlanoMock = { id: 2, nome: 'Essencial', limiteEstabelecimentos: 1, prioridade: false }
export const PLANO_BASICO: PlanoMock = { id: 1, nome: 'Básico', limiteEstabelecimentos: 1, prioridade: false }

/** Módulos alinhados a `PlanoComercialCatalogo` para ProfissionalAutonomo. */
export const MODULOS_AUTONOMO_ESSENCIAL = [
  'Estabelecimento',
  'Assinatura',
  'Agenda',
  'Servicos',
  'HorariosAtendimento',
  'Notificacoes',
  'Email',
  'Clientes',
  'ProfissionalAutonomo',
] as const

export const MODULOS_AUTONOMO_PREMIUM = [
  ...MODULOS_AUTONOMO_ESSENCIAL,
  'WhatsApp',
  'Caixa',
  'Financeiro',
] as const

function buildEstab(
  estabelecimentoId: number,
  nome: string,
  role: EstabelecimentoAcesso['role'],
  permissoes: readonly string[],
  plano: PlanoMock,
  opts: {
    profissionalId?: number | null
    possuiVinculoProfissional?: boolean
    tipoAssinatura?: EstabelecimentoAcesso['tipoAssinatura']
    modulos?: readonly string[]
    limites?: Partial<NonNullable<EstabelecimentoAcesso['limites']>>
  } = {},
): EstabelecimentoAcesso {
  const tipoAssinatura = opts.tipoAssinatura ?? 'Estabelecimento'
  const ehAutonomo = tipoAssinatura === 'ProfissionalAutonomo'
  return {
    estabelecimentoId,
    publicGuid: `mock-guid-${estabelecimentoId}`,
    nome,
    logo: '',
    role,
    possuiVinculoProfissional: opts.possuiVinculoProfissional ?? false,
    profissionalId: opts.profissionalId ?? null,
    profissionalPublicGuid: null,
    permissoes: [...permissoes],
    assinaturaAtiva: true,
    assinaturaId: 1,
    planoId: plano.id,
    planoNome: plano.nome,
    assinaturaStatus: 'Ativa',
    emTrial: false,
    diasTrial: null,
    proximaDataVencimento: '2026-09-05T00:00:00Z',
    modulos: [...(opts.modulos ?? APP_MODULES)],
    tipoAssinatura,
    limites: {
      profissionais: ehAutonomo ? 1 : 10,
      servicos: null,
      agendamentos: null,
      usuarios: ehAutonomo ? 1 : 10,
      agendamentosPorDia: null,
      estabelecimentos: ehAutonomo ? 1 : plano.limiteEstabelecimentos,
      prioridadeListagemPublica: plano.prioridade,
      ...opts.limites,
    },
  }
}

/** Tenant sintético do profissional autônomo (Owner + vínculo profissional). */
function buildAutonomoEstab(
  estabelecimentoId: number,
  nomePublico: string,
  plano: PlanoMock,
  profissionalId: number,
  modulos: readonly string[],
): EstabelecimentoAcesso {
  return buildEstab(estabelecimentoId, nomePublico, 'Owner', APP_PERMISSOES, plano, {
    profissionalId,
    possuiVinculoProfissional: true,
    tipoAssinatura: 'ProfissionalAutonomo',
    modulos,
  })
}

/** Filiais criadas no mock durante a sessão (Minhas Lojas → Adicionar). */
const EXTRA_ESTABS_KEY = 'guc_mock_extra_estabs'

export function mockExtraEstablishments(): EstabelecimentoAcesso[] {
  try {
    const raw = sessionStorage.getItem(EXTRA_ESTABS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as EstabelecimentoAcesso[]
  } catch {
    return []
  }
}

export function mockPushExtraEstablishment(estab: EstabelecimentoAcesso) {
  const list = mockExtraEstablishments()
  if (list.some((e) => e.estabelecimentoId === estab.estabelecimentoId)) return
  list.push(estab)
  sessionStorage.setItem(EXTRA_ESTABS_KEY, JSON.stringify(list))
}

/** Escopo do Dono conforme o plano: Premium = todas as filiais; Básico/Plus = só a principal. */
function ownerScope(plano: PlanoMock): EstabelecimentoAcesso[] {
  const main = buildEstab(1, 'Studio Glow Up', 'Owner', APP_PERMISSOES, plano)
  if (plano.limiteEstabelecimentos <= 1) return [main]
  return [
    main,
    buildEstab(2, 'Glow Up Filial Centro', 'Owner', APP_PERMISSOES, plano),
    ...mockExtraEstablishments(),
  ]
}

/**
 * Lista de estabelecimentos por role do perfil logado.
 * - Cliente (1): sem vínculo (navegação de cliente).
 * - ProfissionalAutonomo (3): tenant sintético próprio (Owner).
 * - Profissional (4): vínculo como Profissional na própria filial.
 * - Admin (5): apenas a filial onde foi cadastrado.
 * - Dono (2): escopo conforme o plano (`plano`).
 */
export function mockEstabelecimentosAcesso(
  profileRole: UserRole = 2,
  plano: PlanoMock = PLANO_PREMIUM,
): EstabelecimentoAcesso[] {
  switch (profileRole) {
    case 1:
      return []
    case 3:
      return [
        buildAutonomoEstab(
          10,
          'Perfil Autônomo',
          plano.nome === 'Essencial' ? PLANO_ESSENCIAL : PLANO_PREMIUM,
          201,
          plano.nome === 'Essencial' ? MODULOS_AUTONOMO_ESSENCIAL : MODULOS_AUTONOMO_PREMIUM,
        ),
      ]
    case 4:
      return [
        buildEstab(1, 'Studio Glow Up', 'Profissional', PERMS_PROFISSIONAL, plano, {
          profissionalId: 102,
          possuiVinculoProfissional: true,
        }),
      ]
    case 5:
      return [
        buildEstab(1, 'Studio Glow Up', 'Admin', PERMS_ADMIN, plano),
      ]
    case 2:
    default:
      return ownerScope(plano)
  }
}

/** Acesso por identidade (e-mail de login). Desconhecido cai em cliente. */
export function mockEstablishmentsForEmail(email: string): EstabelecimentoAcesso[] {
  const e = (email ?? '').trim().toLowerCase()
  if (e === MOCK_CLIENTE.email.toLowerCase()) return []
  if (e === MOCK_USER.email.toLowerCase()) return ownerScope(PLANO_PREMIUM)
  if (e === MOCK_DONO_PLUS.email.toLowerCase()) return ownerScope(PLANO_PLUS)
  if (e === MOCK_DONO_BASICO.email.toLowerCase()) return ownerScope(PLANO_BASICO)
  if (e === MOCK_AUTONOMO_ESSENCIAL.email.toLowerCase()) {
    return [
      buildAutonomoEstab(
        10,
        'Ana Autônoma Essencial',
        PLANO_ESSENCIAL,
        201,
        MODULOS_AUTONOMO_ESSENCIAL,
      ),
    ]
  }
  if (e === MOCK_AUTONOMO_PREMIUM.email.toLowerCase()) {
    return [
      buildAutonomoEstab(
        11,
        'Bruno Autônomo Premium',
        PLANO_PREMIUM,
        202,
        MODULOS_AUTONOMO_PREMIUM,
      ),
    ]
  }
  if (e === MOCK_PROFISSIONAL.email.toLowerCase()) {
    return [
      buildEstab(1, 'Studio Glow Up', 'Profissional', PERMS_PROFISSIONAL, PLANO_PREMIUM, {
        profissionalId: 102,
        possuiVinculoProfissional: true,
      }),
    ]
  }
  if (e === MOCK_ADMIN.email.toLowerCase()) {
    return [buildEstab(1, 'Studio Glow Up', 'Admin', PERMS_ADMIN, PLANO_PREMIUM)]
  }
  if (e === MOCK_RECEPCIONISTA.email.toLowerCase()) {
    return [buildEstab(1, 'Studio Glow Up', 'Receptionist', PERMS_RECEPCIONISTA, PLANO_PREMIUM)]
  }
  return []
}

/** Usuário por identidade (e-mail). Desconhecido cai em cliente. */
export function mockUserForEmail(email: string): User {
  const e = (email ?? '').trim().toLowerCase()
  const map: Record<string, User> = {
    [MOCK_USER.email.toLowerCase()]: MOCK_USER,
    [MOCK_CLIENTE.email.toLowerCase()]: MOCK_CLIENTE,
    [MOCK_PROFISSIONAL.email.toLowerCase()]: MOCK_PROFISSIONAL,
    [MOCK_ADMIN.email.toLowerCase()]: MOCK_ADMIN,
    [MOCK_DONO_PLUS.email.toLowerCase()]: MOCK_DONO_PLUS,
    [MOCK_DONO_BASICO.email.toLowerCase()]: MOCK_DONO_BASICO,
    [MOCK_RECEPCIONISTA.email.toLowerCase()]: MOCK_RECEPCIONISTA,
    [MOCK_AUTONOMO_ESSENCIAL.email.toLowerCase()]: MOCK_AUTONOMO_ESSENCIAL,
    [MOCK_AUTONOMO_PREMIUM.email.toLowerCase()]: MOCK_AUTONOMO_PREMIUM,
  }
  return map[e] ?? MOCK_CLIENTE
}

export function mockEstabelecimentoAcesso(estabelecimentoId: number): EstabelecimentoAcesso {
  return ownerScope(PLANO_PREMIUM).find(
    (e) => e.estabelecimentoId === Number(estabelecimentoId),
  ) ?? ownerScope(PLANO_PREMIUM)[0]
}
