import { horaParaExibicao } from '@/constants/diasSemana'
import type { HorarioFuncionamento, HorarioProfissional } from '@/types/negocio/horario.types'
import type { HorarioProfissionalModoConfig } from '@/types/negocio/horario.types'

export function horariosProfissionalCoincidemComLoja(
  prof: HorarioProfissional,
  loja: HorarioFuncionamento,
): boolean {
  return (
    horaParaExibicao(prof.horaInicio) === horaParaExibicao(loja.horaInicio) &&
    horaParaExibicao(prof.horaFim) === horaParaExibicao(loja.horaFim)
  )
}

export function resolverModoHorarioProfissional(
  prof: HorarioProfissional | null,
  loja: HorarioFuncionamento | null,
): HorarioProfissionalModoConfig {
  if (!prof || !loja?.ativo) return 'personalizado'
  return horariosProfissionalCoincidemComLoja(prof, loja) ? 'loja' : 'personalizado'
}

export function validarIntervaloHorario(horaInicio: string, horaFim: string): string | null {
  if (!horaInicio || !horaFim) return 'Informe um período válido de funcionamento.'
  if (horaInicio === horaFim) return 'Informe um período válido de funcionamento.'
  if (horaInicio > horaFim) return 'O horário de término deve ser posterior ao início.'
  return null
}

export function horarioDentroDoFuncionamentoLoja(
  horaInicio: string,
  horaFim: string,
  loja: HorarioFuncionamento,
): boolean {
  const lojaInicio = horaParaExibicao(loja.horaInicio)
  const lojaFim = horaParaExibicao(loja.horaFim)
  return horaInicio >= lojaInicio && horaFim <= lojaFim
}
