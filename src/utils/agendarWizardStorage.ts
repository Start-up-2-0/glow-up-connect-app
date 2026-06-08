import type { WizardStep } from '@/composables/useAgendarWizard'

export type ModoIdentidadeAgendamento = 'login' | 'register' | 'guest'

export interface AgendarWizardDraft {
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
  cadastroSenha: string
}

const STORAGE_PREFIX = 'guc_agendar_draft_'

function storageKey(publicGuid: string, profissionalGuid: string) {
  return `${STORAGE_PREFIX}${publicGuid}_${profissionalGuid}`
}

export function readAgendarWizardDraft(
  publicGuid: string,
  profissionalGuid: string,
): AgendarWizardDraft | null {
  try {
    const raw = sessionStorage.getItem(storageKey(publicGuid, profissionalGuid))
    if (!raw) return null
    return JSON.parse(raw) as AgendarWizardDraft
  } catch {
    return null
  }
}

export function writeAgendarWizardDraft(
  publicGuid: string,
  profissionalGuid: string,
  draft: AgendarWizardDraft,
) {
  sessionStorage.setItem(storageKey(publicGuid, profissionalGuid), JSON.stringify(draft))
}

export function clearAgendarWizardDraft(publicGuid: string, profissionalGuid: string) {
  sessionStorage.removeItem(storageKey(publicGuid, profissionalGuid))
}
