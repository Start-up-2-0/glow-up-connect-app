import type { EnderecoResumo } from '@/types/estabelecimento.types'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} às ${formatTime(iso)}`
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDistanciaKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

export function formatEnderecoResumo(endereco: EnderecoResumo | null | undefined): string {
  if (!endereco) return 'Endereço não informado'
  const partes = [endereco.logradouro, endereco.bairro, `${endereco.cidade}/${endereco.estado}`]
  return partes.filter(Boolean).join(', ')
}

export function formatPrecoRange(min: number, max: number): string {
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function toTimeOnlyString(date: Date): string {
  return date.toTimeString().slice(0, 8)
}

export function agendamentoStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PendentePagamento: 'Pagamento pendente',
    Confirmado: 'Confirmado',
    EmAtendimento: 'Em atendimento',
    Concluido: 'Concluído',
    Cancelado: 'Cancelado',
    Expirado: 'Expirado',
    Reembolsado: 'Reembolsado',
    PendenteConfirmacao: 'Aguardando confirmação',
    Remarcado: 'Remarcado',
    NaoCompareceu: 'Não compareceu',
  }
  return labels[status] ?? status
}
