export type StepType =
  | 'intro'
  | 'info'
  | 'action'
  | 'input'
  | 'navigation'
  | 'wait'
  | 'success'
  | 'completion'

export type InteractionMode = 'blocked' | 'target-only' | 'free'

export type TutorialKind = 'tutorial' | 'mission'

export type TutorialStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export type TutorialAction = 'click' | 'input' | 'change' | 'submit'

export interface TutorialContext {
  tutorialId: string
  userId: number | null
  estabelecimentoId: number | null
  possuiModulo: (modulo: string) => boolean
  possuiPermissao: (permissao: string) => boolean
  /** Quando true, o usuário edita só o próprio horário (sem profissionais por dia). */
  apenasHorarioProprio?: boolean
}

export interface TutorialStep {
  id: string
  type: StepType
  title: string
  description: string
  tip?: string
  target?: string
  action?: TutorialAction
  waitForEvent?: string
  route?: string
  interaction?: InteractionMode
  skipIf?: (ctx: TutorialContext) => boolean
  condition?: (ctx: TutorialContext) => boolean
  allowBack?: boolean
}

export interface TutorialDefinition {
  id: string
  version: number
  kind: TutorialKind
  title: string
  description: string
  estimatedMinutes: number
  routeName?: string
  routePath?: string
  module?: string
  section?: string
  requerModulo?: string
  requerPermissao?: string
  steps: TutorialStep[]
}

export interface TutorialProgressRecord {
  version: number
  currentStepId: string | null
  status: TutorialStatus
  updatedAt: string
}

export interface GlowGuideStoragePayload {
  tutorials: Record<string, TutorialProgressRecord>
  dismissedSuggestions: Record<string, boolean>
  onboardingChecklist: Record<string, boolean>
}

export interface TargetRect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
}

export type TutorialLayoutMode = 'sheet' | 'popover'

export type PopoverPlacement = 'bottom' | 'right' | 'left' | 'top'
