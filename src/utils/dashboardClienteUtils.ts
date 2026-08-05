import type { AgendamentoCliente } from '@/types/agendamento.types'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import type { User } from '@/types/user.types'
import { calcularVariacaoPercentual } from '@/utils/financeiroDashboard'

const STATUS_CONCLUIDO = new Set(['Concluido', 'Concluído'])
const STATUS_PROXIMOS = new Set([
  'Confirmado',
  'PendenteConfirmacao',
  'Remarcado',
  'EmAtendimento',
  'PendentePagamento',
])

export interface TimelineGroup {
  id: string
  label: string
  items: AgendamentoCliente[]
}

export interface ClienteNovidade {
  id: string
  icon: 'spark' | 'star' | 'gift' | 'calendar'
  message: string
}

export function isAgendamentoConcluido(status: string): boolean {
  return STATUS_CONCLUIDO.has(status)
}

export function isAgendamentoProximo(status: string): boolean {
  return STATUS_PROXIMOS.has(status)
}

export function encontrarProximoAgendamento(
  agendamentos: AgendamentoCliente[],
): AgendamentoCliente | null {
  const now = Date.now()
  return (
    agendamentos
      .filter((a) => isAgendamentoProximo(a.status) && new Date(a.inicio).getTime() >= now)
      .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())[0] ?? null
  )
}

export function agruparHistoricoTimeline(
  agendamentos: AgendamentoCliente[],
  limite = 6,
): TimelineGroup[] {
  const hoje = new Date().toDateString()
  const ontem = new Date(Date.now() - 86400000).toDateString()
  const groups = new Map<string, TimelineGroup>()
  const slice = agendamentos.slice(0, limite)

  for (const ag of slice) {
    const date = new Date(ag.inicio)
    const key = date.toDateString()
    let label: string
    if (key === hoje) label = 'Hoje'
    else if (key === ontem) label = 'Ontem'
    else {
      label = date
        .toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        })
        .replace('.', '')
    }

    if (!groups.has(key)) {
      groups.set(key, { id: key, label, items: [] })
    }
    groups.get(key)!.items.push(ag)
  }

  return Array.from(groups.values())
}

export interface ClienteRelacionamento {
  lojaMaisFrequente: {
    nome: string
    visitas: number
    publicGuid: string
  } | null
  profissionalMaisFrequente: {
    nome: string
    visitas: number
    estabelecimentoNome: string
  } | null
  servicoMaisContratado: {
    nome: string
    vezes: number
  } | null
  ultimaVisita: {
    data: string
    servico: string
    estabelecimento: string
  } | null
  clienteDesde: string | null
  totalAtendimentos: number
  totalGastoAcumulado: number
  /** Média de dias entre atendimentos concluídos; null se < 2 visitas */
  frequenciaMediaDias: number | null
}

export function derivarRelacionamento(
  agendamentos: AgendamentoCliente[],
  totalApi: number,
  clienteDesdeFallback?: string | null,
): ClienteRelacionamento {
  const concluidos = agendamentos
    .filter((a) => isAgendamentoConcluido(a.status))
    .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime())

  const lojas = new Map<string, { nome: string; visitas: number; publicGuid: string }>()
  const profs = new Map<
    string,
    { nome: string; visitas: number; estabelecimentoNome: string }
  >()
  const servicos = new Map<string, { nome: string; vezes: number }>()

  let totalGasto = 0
  for (const ag of concluidos) {
    totalGasto += ag.valorTotal
    const loja = lojas.get(ag.estabelecimentoPublicGuid)
    if (loja) loja.visitas += 1
    else {
      lojas.set(ag.estabelecimentoPublicGuid, {
        nome: ag.estabelecimentoNome,
        visitas: 1,
        publicGuid: ag.estabelecimentoPublicGuid,
      })
    }

    for (const item of ag.itens) {
      const pKey = `${item.profissionalId}`
      const p = profs.get(pKey)
      if (p) p.visitas += 1
      else {
        profs.set(pKey, {
          nome: item.profissionalNome,
          visitas: 1,
          estabelecimentoNome: ag.estabelecimentoNome,
        })
      }

      const sKey = item.servicoNome.trim().toLowerCase()
      const s = servicos.get(sKey)
      if (s) s.vezes += 1
      else servicos.set(sKey, { nome: item.servicoNome, vezes: 1 })
    }
  }

  const lojaMaisFrequente =
    [...lojas.values()].sort((a, b) => b.visitas - a.visitas)[0] ?? null
  const profissionalMaisFrequente =
    [...profs.values()].sort((a, b) => b.visitas - a.visitas)[0] ?? null
  const servicoMaisContratado =
    [...servicos.values()].sort((a, b) => b.vezes - a.vezes)[0] ?? null

  const ultimo = concluidos[0] ?? null
  const ultimaVisita = ultimo
    ? {
        data: ultimo.inicio,
        servico: ultimo.itens[0]?.servicoNome ?? 'Atendimento',
        estabelecimento: ultimo.estabelecimentoNome,
      }
    : null

  const datasAsc = concluidos
    .map((a) => new Date(a.inicio).getTime())
    .sort((a, b) => a - b)

  let frequenciaMediaDias: number | null = null
  if (datasAsc.length >= 2) {
    const gaps: number[] = []
    for (let i = 1; i < datasAsc.length; i++) {
      gaps.push((datasAsc[i]! - datasAsc[i - 1]!) / 86_400_000)
    }
    frequenciaMediaDias = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
  }

  const primeiraData = datasAsc[0]
  const clienteDesde =
    primeiraData != null
      ? new Date(primeiraData).toISOString()
      : (clienteDesdeFallback ?? null)

  return {
    lojaMaisFrequente,
    profissionalMaisFrequente,
    servicoMaisContratado,
    ultimaVisita,
    clienteDesde,
    totalAtendimentos: totalApi > 0 ? totalApi : concluidos.length,
    totalGastoAcumulado: totalGasto,
    frequenciaMediaDias,
  }
}

export function calcularProgressoPerfil(profile: User | null): number {
  if (!profile) return 0
  const checks = checklistPerfil(profile)
  return Math.round((checks.filter((c) => c.done).length / checks.length) * 100)
}

export function checklistPerfil(profile: User | null): { label: string; done: boolean }[] {
  return [
    { label: 'Nome', done: Boolean(profile?.nome?.trim()) },
    { label: 'E-mail', done: Boolean(profile?.email?.trim()) },
    { label: 'Telefone', done: Boolean(profile?.telefone?.trim()) },
    { label: 'Foto de perfil', done: Boolean(profile?.avatarBase64) },
    { label: 'WhatsApp confirmado', done: Boolean(profile?.whatsAppConfirmado) },
  ]
}

export function contarPendenciasPerfil(profile: User | null): number {
  return checklistPerfil(profile).filter((c) => !c.done).length
}

export function gerarNovidades(
  recomendados: EstabelecimentoProximo[],
  temAgendamentos: boolean,
): ClienteNovidade[] {
  const novidades: ClienteNovidade[] = []

  if (recomendados.length > 0) {
    const destaque = recomendados.find((r) => r.destaqueMarketplace) ?? recomendados[0]
    novidades.push({
      id: `novo-${destaque.publicGuid}`,
      icon: 'spark',
      message: `${destaque.nome} está disponível para agendamento${destaque.distanciaKm ? ` · ${destaque.distanciaKm.toFixed(1)} km` : ''}.`,
    })
  }

  if (!temAgendamentos) {
    novidades.push({
      id: 'primeiro-agendamento',
      icon: 'calendar',
      message: 'Agende seu primeiro serviço em poucos cliques e acompanhe tudo por aqui.',
    })
  }

  novidades.push({
    id: 'explorar',
    icon: 'star',
    message: 'Compare avaliações e encontre barbearias e salões perto de você.',
  })

  return novidades.slice(0, 3)
}

export function mensagemBoasVindas(
  primeiroNome: string,
  proximo: AgendamentoCliente | null,
): { titulo: string; subtitulo: string } {
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  if (proximo) {
    const dia = labelDiaAgendamento(proximo.inicio)
    const horaFmt = new Date(proximo.inicio).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return {
      titulo: `${saudacao}, ${primeiroNome}`,
      subtitulo: `Seu próximo atendimento é ${dia.toLowerCase()} às ${horaFmt}.`,
    }
  }

  return {
    titulo: `${saudacao}, ${primeiroNome}`,
    subtitulo: 'Pronto para o próximo horário? Explore profissionais perto de você.',
  }
}

export function labelDiaAgendamento(iso: string): string {
  const date = new Date(iso)
  const hoje = new Date()
  if (date.toDateString() === hoje.toDateString()) return 'Hoje'
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  if (date.toDateString() === amanha.toDateString()) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  }).replace('.', '')
}

export { calcularVariacaoPercentual }
