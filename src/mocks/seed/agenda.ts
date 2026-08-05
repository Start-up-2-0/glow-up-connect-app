import type { AgendaGeral, AgendaProfissional } from '@/types/negocio/agenda.types'
import type { AgendamentoCliente } from '@/types/agendamento.types'
import type { AvaliacaoNegocioItem, AvaliacaoResumoPublico } from '@/types/avaliacao.types'

const PUBLIC_GUID = 'a1b2c3d4e5f6a7b8c9d0e1f2'
const ENDERECO = { logradouro: 'Av. das Acácias, 250', bairro: 'Centro', cidade: 'Aracaju', estado: 'SE' }

function iso(daysFromNow: number, hour = 10): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const MOCK_AGENDA_GERAL: AgendaGeral[] = [
  {
    id: 10,
    usuarioClienteId: 501,
    clienteNome: 'Ana Paula Torres',
    clienteEmail: 'ana.torres@gmail.com',
    clienteTelefone: '(79) 98811-0011',
    status: 'Confirmado',
    valorTotal: 60,
    inicio: iso(0, 9),
    fim: iso(0, 10),
    observacao: null,
    itens: [{ id: 1010, servicoId: 1, servicoNome: 'Corte de Cabelo', profissionalId: 101, profissionalNome: 'Marina Alves', inicio: iso(0, 9), fim: iso(0, 10), valor: 60, status: 'Agendado' }],
  },
  {
    id: 11,
    usuarioClienteId: 502,
    clienteNome: 'Beatriz Nunes',
    clienteEmail: 'bia.nunes@hotmail.com',
    clienteTelefone: '(79) 98822-0022',
    status: 'EmAtendimento',
    valorTotal: 200,
    inicio: iso(0, 11),
    fim: iso(0, 13),
    observacao: 'Cliente pediu retoque leve.',
    itens: [{ id: 1011, servicoId: 2, servicoNome: 'Coloração', profissionalId: 102, profissionalNome: 'Carlos Mendes', inicio: iso(0, 11), fim: iso(0, 13), valor: 200, status: 'EmAtendimento' }],
  },
  {
    id: 12,
    usuarioClienteId: null,
    clienteNome: 'Camila Ferreira',
    clienteEmail: null,
    clienteTelefone: '(79) 98833-0033',
    status: 'Agendado',
    valorTotal: 45,
    inicio: iso(0, 15),
    fim: iso(0, 16),
    observacao: null,
    itens: [{ id: 1012, servicoId: 3, servicoNome: 'Escova Modeladora', profissionalId: 103, profissionalNome: 'Patrícia Rocha', inicio: iso(0, 15), fim: iso(0, 16), valor: 45, status: 'Agendado' }],
  },
  {
    id: 13,
    usuarioClienteId: 505,
    clienteNome: 'Elaine Martins',
    clienteEmail: 'elaine.m@yahoo.com',
    clienteTelefone: '(79) 98855-0055',
    status: 'Realizado',
    valorTotal: 100,
    inicio: iso(-1, 14),
    fim: iso(-1, 15),
    observacao: null,
    itens: [
      { id: 1013, servicoId: 1, servicoNome: 'Corte de Cabelo', profissionalId: 101, profissionalNome: 'Marina Alves', inicio: iso(-1, 14), fim: iso(-1, 16), valor: 60, status: 'Concluido' },
    ],
  },
  {
    id: 14,
    usuarioClienteId: 500,
    clienteNome: 'Débora Castro',
    clienteEmail: 'debora.castro@gmail.com',
    clienteTelefone: null,
    status: 'Cancelado',
    valorTotal: 40,
    inicio: iso(1, 10),
    fim: iso(1, 11),
    observacao: 'Cliente não compareceu.',
    itens: [{ id: 1014, servicoId: 4, servicoNome: 'Manicure Completa', profissionalId: 103, profissionalNome: 'Patrícia Rocha', inicio: iso(1, 10), fim: iso(1, 11), valor: 40, status: 'Cancelado' }],
  },
]

export const MOCK_AGENDA_PROPRIA: AgendaProfissional[] = [
  { agendamentoItemId: 2010, agendamentoId: 10, usuarioClienteId: 501, clienteNome: 'Ana Paula Torres', clienteEmail: 'ana.torres@gmail.com', clienteTelefone: '(79) 98811-0011', servicoId: 1, servicoNome: 'Corte de Cabelo', inicio: iso(0, 9), fim: iso(0, 10), status: 'Concluido', agendamentoStatus: 'Confirmado' },
  { agendamentoItemId: 2011, agendamentoId: 15, usuarioClienteId: null, clienteNome: 'Fernanda Dias', clienteEmail: null, clienteTelefone: '(79) 99888-7766', servicoId: 5, servicoNome: 'Design de Sobrancelhas', inicio: iso(0, 13), fim: iso(0, 14), status: 'Agendado', agendamentoStatus: 'Agendado' },
  { agendamentoItemId: 2012, agendamentoId: 16, usuarioClienteId: 505, clienteNome: 'Elaine Martins', clienteEmail: 'elaine.m@yahoo.com', clienteTelefone: '(79) 98855-0055', servicoId: 3, servicoNome: 'Escova Modeladora', inicio: iso(-1, 16), fim: iso(-1, 17), status: 'Concluido', agendamentoStatus: 'Realizado' },
]

export const MOCK_AGENDAMENTOS_ME: AgendamentoCliente[] = [
  {
    id: 10,
    status: 'Concluído',
    valorTotal: 60,
    duracaoTotalMinutos: 60,
    inicio: iso(-3, 9),
    fim: iso(-3, 10),
    estabelecimentoPublicGuid: PUBLIC_GUID,
    estabelecimentoNome: 'Studio Glow Up',
    estabelecimentoLogo: '',
    endereco: ENDERECO,
    observacao: '',
    origem: 'online',
    createAd: iso(-5),
    canceladoEm: null,
    itens: [{ id: 1010, servicoId: 1, servicoNome: 'Corte de Cabelo', profissionalId: 101, profissionalNome: 'Marina Alves', inicio: iso(-3, 9), fim: iso(-3, 10), valor: 60, status: 'Concluido' }],
    avaliacaoStatus: 'Realizada',
    avaliacaoResumo: { notaEstabelecimento: 5, notaProfissional: 5, avaliadoEm: iso(-3, 20) },
  },
  {
    id: 11,
    status: 'Confirmado',
    valorTotal: 200,
    duracaoTotalMinutos: 120,
    inicio: iso(1, 11),
    fim: iso(1, 13),
    estabelecimentoPublicGuid: 'a1b2c3d4e5f6a7b8c9d0e1f2',
    estabelecimentoNome: 'Studio Glow Up',
    estabelecimentoLogo: '',
    endereco: ENDERECO,
    observacao: '',
    origem: 'online',
    createAd: iso(-2),
    canceladoEm: null,
    itens: [{ id: 2, servicoId: 2, servicoNome: 'Coloração', profissionalId: 102, profissionalNome: 'Carlos Mendes', inicio: iso(1, 11), fim: iso(1, 13), valor: 200, status: 'Confirmado' }],
    avaliacaoStatus: 'Indisponivel',
  },
]

export const MOCK_AVALIACAO_RESUMO: AvaliacaoResumoPublico = {
  notaMedia: 4.8,
  totalAvaliacoes: 68,
  janelaDias: 30,
  distribuicao: [
    { nota: 5, quantidade: 48 },
    { nota: 4, quantidade: 14 },
    { nota: 3, quantidade: 4 },
    { nota: 2, quantidade: 1 },
    { nota: 1, quantidade: 1 },
  ],
}

export const MOCK_AVALIACOES_NEGOCIO: AvaliacaoNegocioItem[] = [
  { id: 1, agendamentoId: 10, notaEstabelecimento: 5, comentarioEstabelecimento: 'Atendimento excelente, super recomendo!', notaProfissional: 5, comentarioProfissional: 'A Marina é incrível.', avaliadoEm: iso(-3), clienteNome: 'Ana Paula Torres', profissionalNome: 'Marina Alves' },
  { id: 2, agendamentoId: 13, notaEstabelecimento: 4, comentarioEstabelecimento: 'Muito bom, só demorou um pouco.', notaProfissional: 5, comentarioProfissional: null, avaliadoEm: iso(-2), clienteNome: 'Elaine Martins', profissionalNome: 'Marina Alves' },
  { id: 3, agendamentoId: 17, notaEstabelecimento: 5, comentarioEstabelecimento: 'Ambiente agradável e cuidado.', notaProfissional: 4, comentarioProfissional: 'Gostei bastante.', avaliadoEm: iso(-1), clienteNome: 'Camila Ferreira', profissionalNome: 'Carlos Mendes' },
]

/** Seeds do modo mockado — agenda, agendamentos e avaliações. */
export function guidEstabelecimento() {
  return 'a1b2c3d4e5f6a7b8c9d0e1f2'
}