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
