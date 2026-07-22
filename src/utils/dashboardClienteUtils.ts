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
): TimelineGroup[] {
  const hoje = new Date().toDateString()
  const ontem = new Date(Date.now() - 86400000).toDateString()
  const groups = new Map<string, TimelineGroup>()

  for (const ag of agendamentos) {
    const date = new Date(ag.inicio)
    const key = date.toDateString()
    let label: string
    if (key === hoje) label = 'Hoje'
    else if (key === ontem) label = 'Ontem'
    else {
      label = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      }).replace('.', '')
    }

    if (!groups.has(key)) {
      groups.set(key, { id: key, label, items: [] })
    }
    groups.get(key)!.items.push(ag)
  }

  return Array.from(groups.values())
}

export function calcularProgressoPerfil(profile: User | null): number {
  if (!profile) return 0
  const checks = [
    Boolean(profile.nome?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.telefone?.trim()),
    Boolean(profile.avatarBase64),
    Boolean(profile.whatsAppConfirmado),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
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
    return {
      titulo: `${saudacao}, ${primeiroNome} ✨`,
      subtitulo: 'Seu próximo atendimento está logo abaixo.',
    }
  }

  return {
    titulo: `${saudacao}, ${primeiroNome} 👋`,
    subtitulo: 'Pronto para o próximo corte? Encontre um profissional perto de você.',
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
