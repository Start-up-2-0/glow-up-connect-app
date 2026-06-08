import type { WizardStep } from '@/composables/useAgendarWizard'

export type ModoIdentidadeAgendamento = 'login' | 'register' | 'guest'

/** Dados persistidos no navegador — nunca inclui senha. */
export interface AgendarWizardDraft {
  version: number
  savedAt: number
  step: WizardStep
  modoIdentidade: ModoIdentidadeAgendamento | null
  selectedServicoIds: number[]
  selectedProfissionalGuid: string
  selectedDate: string
  selectedSlotInicio: string | null
  observacao: string
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
}

/** Payload de escrita antes da sanitização no storage. */
export type AgendarWizardDraftInput = Omit<AgendarWizardDraft, 'version' | 'savedAt'>

const STORAGE_PREFIX = 'guc_agendar_draft_'
const DRAFT_VERSION = 1
const DRAFT_TTL_MS = 30 * 60 * 1000

const MAX_NOME = 120
const MAX_EMAIL = 254
const MAX_TELEFONE = 32
const MAX_OBSERVACAO = 500

const STEPS_NAO_PERSISTIDOS: readonly WizardStep[] = ['sucesso', 'sucesso_cadastro']

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

function storageKey(publicGuid: string, profissionalGuid: string) {
  return `${STORAGE_PREFIX}${publicGuid}_${profissionalGuid}`
}

function clampText(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function sanitizeServicoIds(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
    .slice(0, 20)
}

function sanitizeStep(value: unknown): WizardStep | null {
  const allowed: WizardStep[] = [
    'identidade',
    'contato',
    'servicos',
    'horario',
    'confirmar',
  ]
  return typeof value === 'string' && allowed.includes(value as WizardStep)
    ? (value as WizardStep)
    : null
}

function sanitizeModo(value: unknown): ModoIdentidadeAgendamento | null {
  if (value === 'guest' || value === 'register' || value === 'login') return value
  return null
}

function sanitizeDate(value: unknown): string {
  const text = clampText(value, 10)
  return DATE_ONLY_RE.test(text) ? text : ''
}

function shouldPersistContact(modo: ModoIdentidadeAgendamento | null): boolean {
  return modo === 'guest' || modo === 'register'
}

function buildPersistedDraft(input: AgendarWizardDraftInput): AgendarWizardDraft | null {
  if (STEPS_NAO_PERSISTIDOS.includes(input.step)) return null

  const step = sanitizeStep(input.step)
  if (!step) return null

  const modoIdentidade = sanitizeModo(input.modoIdentidade)
  const persistContact = shouldPersistContact(modoIdentidade)

  return {
    version: DRAFT_VERSION,
    savedAt: Date.now(),
    step,
    modoIdentidade,
    selectedServicoIds: sanitizeServicoIds(input.selectedServicoIds),
    selectedProfissionalGuid: clampText(input.selectedProfissionalGuid, 64),
    selectedDate: sanitizeDate(input.selectedDate),
    selectedSlotInicio: clampText(input.selectedSlotInicio, 40) || null,
    observacao: clampText(input.observacao, MAX_OBSERVACAO),
    clienteNome: persistContact ? clampText(input.clienteNome, MAX_NOME) : '',
    clienteEmail: persistContact ? clampText(input.clienteEmail, MAX_EMAIL) : '',
    clienteTelefone: persistContact ? clampText(input.clienteTelefone, MAX_TELEFONE) : '',
  }
}

function parseRawDraft(raw: string): unknown {
  return JSON.parse(raw) as unknown
}

function normalizeLegacyDraft(
  parsed: Record<string, unknown>,
  profissionalGuid: string,
): AgendarWizardDraft | null {
  const step = sanitizeStep(parsed.step)
  if (!step) return null

  const modoIdentidade = sanitizeModo(parsed.modoIdentidade)
  const persistContact = shouldPersistContact(modoIdentidade)
  const savedAt =
    typeof parsed.savedAt === 'number' && Number.isFinite(parsed.savedAt)
      ? parsed.savedAt
      : Date.now()

  if (Date.now() - savedAt > DRAFT_TTL_MS) return null

  const guid = clampText(parsed.selectedProfissionalGuid, 64)
  if (guid && guid !== profissionalGuid) return null

  return {
    version: DRAFT_VERSION,
    savedAt,
    step,
    modoIdentidade,
    selectedServicoIds: sanitizeServicoIds(parsed.selectedServicoIds),
    selectedProfissionalGuid: profissionalGuid,
    selectedDate: sanitizeDate(parsed.selectedDate),
    selectedSlotInicio: clampText(parsed.selectedSlotInicio, 40) || null,
    observacao: clampText(parsed.observacao, MAX_OBSERVACAO),
    clienteNome: persistContact ? clampText(parsed.clienteNome, MAX_NOME) : '',
    clienteEmail: persistContact ? clampText(parsed.clienteEmail, MAX_EMAIL) : '',
    clienteTelefone: persistContact ? clampText(parsed.clienteTelefone, MAX_TELEFONE) : '',
  }
}

export function readAgendarWizardDraft(
  publicGuid: string,
  profissionalGuid: string,
): AgendarWizardDraft | null {
  try {
    const raw = sessionStorage.getItem(storageKey(publicGuid, profissionalGuid))
    if (!raw) return null

    const parsed = parseRawDraft(raw)
    if (!parsed || typeof parsed !== 'object') {
      clearAgendarWizardDraft(publicGuid, profissionalGuid)
      return null
    }

    const record = parsed as Record<string, unknown>

    // Descarta rascunhos legados que persistiam senha em texto claro.
    if ('cadastroSenha' in record) {
      clearAgendarWizardDraft(publicGuid, profissionalGuid)
      return null
    }

    const draft = normalizeLegacyDraft(record, profissionalGuid)
    if (!draft) {
      clearAgendarWizardDraft(publicGuid, profissionalGuid)
      return null
    }

    if (draft.version !== DRAFT_VERSION) {
      clearAgendarWizardDraft(publicGuid, profissionalGuid)
      return null
    }

    if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      clearAgendarWizardDraft(publicGuid, profissionalGuid)
      return null
    }

    return draft
  } catch {
    clearAgendarWizardDraft(publicGuid, profissionalGuid)
    return null
  }
}

export function writeAgendarWizardDraft(
  publicGuid: string,
  profissionalGuid: string,
  draft: AgendarWizardDraftInput,
) {
  const persisted = buildPersistedDraft({
    ...draft,
    selectedProfissionalGuid: profissionalGuid,
  })

  const key = storageKey(publicGuid, profissionalGuid)
  if (!persisted) {
    sessionStorage.removeItem(key)
    return
  }

  sessionStorage.setItem(key, JSON.stringify(persisted))
}

export function clearAgendarWizardDraft(publicGuid: string, profissionalGuid: string) {
  sessionStorage.removeItem(storageKey(publicGuid, profissionalGuid))
}
