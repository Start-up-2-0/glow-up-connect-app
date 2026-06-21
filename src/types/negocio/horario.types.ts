export interface HorarioFuncionamento {
  id: number
  estabelecimentoId: number
  diaSemana: string
  horaInicio: string
  horaFim: string
  ativo: boolean
}

export interface HorarioProfissional {
  id: number
  profissionalId: number
  diaSemana: string
  horaInicio: string
  horaFim: string
  ativo: boolean
}

export interface HorarioPayload {
  diaSemana: string
  horaInicio: string
  horaFim: string
}

export type HorarioProfissionalModoConfig = 'loja' | 'personalizado'

export interface ProfissionalDiaHorarioConfig {
  profissionalId: number
  nomePublico: string
  avatarUrl: string | null
  selecionado: boolean
  modo: HorarioProfissionalModoConfig
  horaInicio: string
  horaFim: string
  horarioId: number | null
  dirty: boolean
}
