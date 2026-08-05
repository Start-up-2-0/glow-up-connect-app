import type { Plano } from '@/types/plano.types'

export const LANDING_PLANO_MAX_FEATURES = 5

export const PLANO_LIMITE_ITEMS = [
  { key: 'limiteUsuarios', label: 'Usuários' },
  { key: 'limiteProfissionais', label: 'Profissionais' },
  { key: 'limiteServicos', label: 'Serviços' },
  { key: 'limiteAgendamentos', label: 'Agendamentos' },
] as const satisfies ReadonlyArray<{
  key: 'limiteUsuarios' | 'limiteProfissionais' | 'limiteServicos' | 'limiteAgendamentos'
  label: string
}>

export function getPlanoFeatures(plano: Plano): string[] {
  return plano.funcionalidades.length > 0 ? plano.funcionalidades : plano.modulos
}

const MODULO_LABELS: Record<string, string> = {
  Estabelecimento: 'Estabelecimento',
  Assinatura: 'Assinatura',
  Agenda: 'Agenda',
  Servicos: 'Serviços',
  HorariosAtendimento: 'Horários de atendimento',
  Caixa: 'Caixa',
  Financeiro: 'Financeiro',
  ComissaoProfissionais: 'Comissões de profissionais',
  Clientes: 'Clientes',
  Profissionais: 'Profissionais',
  WhatsApp: 'WhatsApp',
}

export function humanizarModulo(nome: string): string {
  if (MODULO_LABELS[nome]) return MODULO_LABELS[nome]
  return nome
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
}

export function ordenarPlanosPorPreco(planos: Plano[]): Plano[] {
  return [...planos].sort((a, b) => a.preco - b.preco)
}

export function limitesComoItens(plano: Plano): string[] {
  const frase = (valor: number | null | undefined, label: string) => {
    if (valor === null || valor === undefined) return `${label} ilimitados`
    return `${valor} ${label}`
  }

  const itens = [
    frase(plano.limiteUsuarios, 'usuários'),
    frase(plano.limiteProfissionais, 'profissionais'),
    frase(plano.limiteServicos, 'serviços'),
    frase(plano.limiteAgendamentos, 'agendamentos'),
  ]

  if (plano.limiteEstabelecimentos != null && plano.limiteEstabelecimentos > 1) {
    itens.push(`Até ${plano.limiteEstabelecimentos} unidades`)
  } else {
    itens.push('1 unidade')
  }

  return itens
}

/** Recursos exclusivos do plano (não presentes no plano anterior mais barato). */
export function recursosIncrementais(plano: Plano, anterior: Plano | null): string[] {
  if (!anterior) {
    const base = plano.funcionalidades.length
      ? plano.funcionalidades
      : plano.modulos.map(humanizarModulo)
    return [...new Set(base)]
  }

  const modsAnteriores = new Set(anterior.modulos)
  const funcsAnteriores = new Set(anterior.funcionalidades.map((f) => f.toLowerCase()))

  const novosModulos = plano.modulos
    .filter((m) => !modsAnteriores.has(m))
    .map(humanizarModulo)

  const novasFuncs = plano.funcionalidades.filter((f) => {
    const key = f.toLowerCase()
    if (funcsAnteriores.has(key)) return false
    if (key.startsWith('tudo do')) return false
    return true
  })

  const extras: string[] = []
  if (plano.prioridadeListagemPublica && !anterior.prioridadeListagemPublica) {
    extras.push('Destaque no marketplace')
  }
  if (
    (plano.limiteEstabelecimentos ?? 1) > (anterior.limiteEstabelecimentos ?? 1)
  ) {
    extras.push(
      plano.limiteEstabelecimentos == null
        ? 'Unidades ilimitadas'
        : `Até ${plano.limiteEstabelecimentos} unidades`,
    )
  }
  if (plano.limiteServicos == null && anterior.limiteServicos != null) {
    extras.push('Serviços ilimitados')
  }
  if (plano.limiteAgendamentos == null && anterior.limiteAgendamentos != null) {
    extras.push('Agendamentos ilimitados')
  }

  return [...new Set([...extras, ...novasFuncs, ...novosModulos])]
}

export function herancaLabel(plano: Plano, anterior: Plano | null): string | null {
  if (!anterior) return null
  return `Tudo do ${anterior.nome} +`
}

export function badgePlano(plano: Plano, planosOrdenados: Plano[]): string | null {
  if (planosOrdenados.length === 0) return null
  const popular = planosOrdenados.find((p) => p.nome === 'Plus') ?? planosOrdenados[1]
  if (popular && plano.id === popular.id) return 'Mais popular'
  if (plano.nome === 'Premium') return 'Para redes'
  if (plano.preco === 0) return 'Para começar'
  return null
}
