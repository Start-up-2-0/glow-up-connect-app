export type LojaSetupMode = 'assinatura' | 'adicionar-unidade'

export type LojaSetupStepId =
  | 'loja'
  | 'equipe'
  | 'servicos'
  | 'horarios'
  | 'revisao'

export type LojaSetupLojaSubstep = 'informacoes-basicas' | 'endereco'

export interface LojaSetupSkipped {
  equipe: boolean
  servicos: boolean
  horarios: boolean
}

export interface LojaSetupDraft {
  mode: LojaSetupMode
  step: LojaSetupStepId
  lojaSubstep: LojaSetupLojaSubstep
  estabelecimentoId: number | null
  assinaturaId: number | null
  skipped: LojaSetupSkipped
}

export const LOJA_SETUP_STEPS = [
  { id: 'loja', label: 'Loja' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'horarios', label: 'Horários' },
  { id: 'revisao', label: 'Revisão' },
] as const satisfies ReadonlyArray<{ id: LojaSetupStepId; label: string }>

export const LOJA_SETUP_STEP_SUBTITLES: Record<LojaSetupStepId, string> = {
  loja: 'Cadastre os dados da nova unidade vinculada à sua assinatura Premium.',
  equipe: 'Adicione profissionais agora ou configure depois no dashboard.',
  servicos: 'Cadastre os serviços oferecidos pela loja.',
  horarios: 'Defina os dias e horários de funcionamento.',
  revisao: 'Revise o que foi configurado antes de entrar no painel.',
}

export const LOJA_SETUP_STEP_SUBTITLES_AUTONOMO: Partial<Record<LojaSetupStepId, string>> = {
  servicos: 'O que você oferece e quanto cobra',
  horarios: 'Quando você atende',
  revisao: 'Revise o que foi configurado antes de entrar no painel.',
}

export const LOJA_SETUP_STORAGE_KEY = 'guc_loja_setup'

export function emptyLojaSetupSkipped(): LojaSetupSkipped {
  return { equipe: false, servicos: false, horarios: false }
}
