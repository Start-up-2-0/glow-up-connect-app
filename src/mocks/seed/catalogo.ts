import type { Servico } from '@/types/negocio/servico.types'
import type { ProfissionalEquipe, UsuarioEquipe } from '@/types/negocio/equipe.types'
import type { HorarioFuncionamento, HorarioProfissional } from '@/types/negocio/horario.types'

export const ESTABELECIMENTO_ID_PADRAO = 1

function iso(daysFromNow: number, hour = 12, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const MOCK_SERVICOS: Servico[] = [
  {
    id: 1,
    estabelecimentoId: 1,
    nome: 'Corte de Cabelo',
    descricao: 'Corte masculino ou feminino com finalização.',
    precoBase: 60,
    duracaoMinutos: 45,
    tipoServico: 'Individual',
    ativo: true,
    profissionais: [
      { profissionalId: 101, preco: 60, duracaoMinutos: 45, ativo: true },
      { profissionalId: 102, preco: 70, duracaoMinutos: 45, ativo: true },
    ],
  },
  {
    id: 2,
    estabelecimentoId: 1,
    nome: 'Coloração',
    descricao: 'Coloração completa com matizador.',
    precoBase: 180,
    duracaoMinutos: 120,
    tipoServico: 'Individual',
    ativo: true,
    profissionais: [{ profissionalId: 102, preco: 200, duracaoMinutos: 150, ativo: true }],
  },
  {
    id: 3,
    estabelecimentoId: 1,
    nome: 'Escova Modeladora',
    descricao: 'Escova com chapinha ou modelador.',
    precoBase: 45,
    duracaoMinutos: 40,
    tipoServico: 'Individual',
    ativo: true,
    profissionais: [
      { profissionalId: 101, preco: 45, duracaoMinutos: 40, ativo: true },
      { profissionalId: 103, preco: 50, duracaoMinutos: 40, ativo: true },
    ],
  },
  {
    id: 4,
    estabelecimentoId: 1,
    nome: 'Manicure Completa',
    descricao: 'Corte, lixa e esmaltação das unhas.',
    precoBase: 40,
    duracaoMinutos: 50,
    tipoServico: 'Individual',
    ativo: true,
    profissionais: [{ profissionalId: 103, preco: 40, duracaoMinutos: 50, ativo: true }],
  },
  {
    id: 5,
    estabelecimentoId: 1,
    nome: 'Design de Sobrancelhas',
    descricao: 'Design com pinça e cera.',
    precoBase: 35,
    duracaoMinutos: 30,
    tipoServico: 'Individual',
    ativo: true,
    profissionais: [{ profissionalId: 101, preco: 35, duracaoMinutos: 30, ativo: true }],
  },
  {
    id: 6,
    estabelecimentoId: 1,
    nome: 'Progressiva',
    descricao: 'Alisamento com queratina.',
    precoBase: 320,
    duracaoMinutos: 180,
    tipoServico: 'Individual',
    ativo: false,
    profissionais: [{ profissionalId: 102, preco: 350, duracaoMinutos: 180, ativo: true }],
  },
  {
    id: 7,
    estabelecimentoId: 1,
    nome: 'Combo Completo',
    descricao: 'Corte, barba e sobrancelha.',
    precoBase: 75,
    duracaoMinutos: 90,
    tipoServico: 'Combo',
    ativo: true,
    profissionais: [{ profissionalId: 101, preco: 75, duracaoMinutos: 90, ativo: true }],
  },
]

export const MOCK_USUARIOS_EQUIPE: UsuarioEquipe[] = [
  { id: 1, estabelecimentoId: 1, usuarioId: 1, nome: 'Gustavo Souza', email: 'gustavo@glowup.com.br', telefone: '(79) 97999-1763', role: 'Owner', ativo: true },
  /** Login mock: admin@teste.com */
  { id: 2, estabelecimentoId: 1, usuarioId: 80, nome: 'Roberto Admin', email: 'admin@teste.com', telefone: '(79) 99999-3333', role: 'Admin', ativo: true },
  /** Login mock: recepcionista@teste.com */
  { id: 3, estabelecimentoId: 1, usuarioId: 83, nome: 'Fernanda Recepção', email: 'recepcionista@teste.com', telefone: '(79) 99999-6666', role: 'Receptionist', ativo: true },
  { id: 4, estabelecimentoId: 1, usuarioId: 11, nome: 'Marina Alves', email: 'marina@glowup.com.br', telefone: '(79) 99811-2233', role: 'Admin', ativo: true },
]

export const MOCK_PROFISSIONAIS: ProfissionalEquipe[] = [
  { id: 101, estabelecimentoId: 1, profissionalId: 101, usuarioId: 11, nomePublico: 'Marina Alves', email: 'marina@glowup.com.br', telefone: '(79) 99811-2233', podeReceberAgendamento: true, ativo: true, notaMedia: 4.9, totalAvaliacoes: 32, foto: null },
  { id: 102, estabelecimentoId: 1, profissionalId: 102, usuarioId: 21, nomePublico: 'Carlos Mendes', email: 'carlos@glowup.com.br', telefone: '(79) 99877-8899', podeReceberAgendamento: true, ativo: true, notaMedia: 4.7, totalAvaliacoes: 21, foto: null },
  { id: 103, estabelecimentoId: 1, profissionalId: 103, usuarioId: 22, nomePublico: 'Patrícia Rocha', email: 'patricia@glowup.com.br', telefone: '(79) 99900-1122', podeReceberAgendamento: true, ativo: true, notaMedia: 4.8, totalAvaliacoes: 15, foto: null },
]

export const MOCK_CLIENTES = [
  { nome: 'Ana Paula Torres', email: 'ana.torres@gmail.com', telefone: '(79) 98811-0011', totalAgendamentos: 6, ultimoAgendamentoEm: iso(-3, 16) },
  { nome: 'Beatriz Nunes', email: 'bia.nunes@hotmail.com', telefone: '(79) 98822-0022', totalAgendamentos: 3, ultimoAgendamentoEm: iso(-1, 11) },
  { nome: 'Camila Ferreira', email: null, telefone: '(79) 98833-0033', totalAgendamentos: 1, ultimoAgendamentoEm: iso(-7, 10) },
  { nome: 'Débora Castro', email: 'debora.castro@gmail.com', telefone: null, totalAgendamentos: 9, ultimoAgendamentoEm: iso(-12, 15) },
  { nome: 'Elaine Martins', email: 'elaine.m@yahoo.com', telefone: '(79) 98855-0055', totalAgendamentos: 2, ultimoAgendamentoEm: iso(-2, 14) },
]

export const MOCK_HORARIOS_LOJA: HorarioFuncionamento[] = [
  { id: 1, estabelecimentoId: 1, diaSemana: 'Monday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 2, estabelecimentoId: 1, diaSemana: 'Tuesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 3, estabelecimentoId: 1, diaSemana: 'Wednesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 4, estabelecimentoId: 1, diaSemana: 'Thursday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 5, estabelecimentoId: 1, diaSemana: 'Friday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 6, estabelecimentoId: 1, diaSemana: 'Saturday', horaInicio: '09:00:00', horaFim: '14:00:00', ativo: true },
  { id: 7, estabelecimentoId: 1, diaSemana: 'Sunday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: false },
]

export const MOCK_HORARIOS_PROFISSIONAIS: HorarioProfissional[] = [
  { id: 1, profissionalId: 101, diaSemana: 'Monday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 2, profissionalId: 102, diaSemana: 'Monday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 3, profissionalId: 103, diaSemana: 'Monday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 4, profissionalId: 101, diaSemana: 'Tuesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 5, profissionalId: 102, diaSemana: 'Tuesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 6, profissionalId: 101, diaSemana: 'Wednesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 7, profissionalId: 102, diaSemana: 'Wednesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 8, profissionalId: 103, diaSemana: 'Wednesday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 9, profissionalId: 101, diaSemana: 'Thursday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 10, profissionalId: 103, diaSemana: 'Friday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 11, profissionalId: 102, diaSemana: 'Friday', horaInicio: '08:00:00', horaFim: '20:00:00', ativo: true },
  { id: 12, profissionalId: 101, diaSemana: 'Saturday', horaInicio: '09:00:00', horaFim: '14:00:00', ativo: true },
  { id: 13, profissionalId: 102, diaSemana: 'Saturday', horaInicio: '09:00:00', horaFim: '14:00:00', ativo: true },
]
