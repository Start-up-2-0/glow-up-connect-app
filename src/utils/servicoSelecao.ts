export type TipoServicoCatalogo = 'Individual' | 'Combo'

export interface ServicoSelecaoCatalogoItem {
  id: number
  tipoServico: TipoServicoCatalogo
}

export interface ServicoSelecaoResultado {
  ok: boolean
  motivo?: string
}

export function ehCombo(tipoServico: TipoServicoCatalogo | string | undefined): boolean {
  return tipoServico === 'Combo'
}

export function temComboSelecionado(
  ids: readonly number[],
  catalogo: readonly ServicoSelecaoCatalogoItem[],
): boolean {
  return ids.some((id) => {
    const servico = catalogo.find((item) => item.id === id)
    return servico ? ehCombo(servico.tipoServico) : false
  })
}

export function podeSelecionarServico(
  ids: readonly number[],
  servico: ServicoSelecaoCatalogoItem,
  catalogo: readonly ServicoSelecaoCatalogoItem[],
): ServicoSelecaoResultado {
  if (ids.includes(servico.id)) {
    return { ok: true }
  }

  if (ehCombo(servico.tipoServico)) {
    return { ok: true }
  }

  if (temComboSelecionado(ids, catalogo)) {
    return {
      ok: false,
      motivo: 'Combo não pode ser combinado com outros serviços.',
    }
  }

  return { ok: true }
}

export function toggleServicoSelecionado(
  ids: readonly number[],
  servicoId: number,
  catalogo: readonly ServicoSelecaoCatalogoItem[],
): number[] {
  const servico = catalogo.find((item) => item.id === servicoId)
  if (!servico) return [...ids]

  const index = ids.indexOf(servicoId)
  if (index >= 0) {
    return ids.filter((id) => id !== servicoId)
  }

  if (ehCombo(servico.tipoServico)) {
    return [servicoId]
  }

  if (temComboSelecionado(ids, catalogo)) {
    return [servicoId]
  }

  return [...ids, servicoId]
}

export function normalizarSelecaoServicos(
  ids: readonly number[],
  catalogo: readonly ServicoSelecaoCatalogoItem[],
): number[] {
  const permitidos = new Set(catalogo.map((item) => item.id))
  const filtrados = ids.filter((id) => permitidos.has(id))
  if (filtrados.length === 0) return []

  const combos = filtrados.filter((id) => {
    const servico = catalogo.find((item) => item.id === id)
    return servico ? ehCombo(servico.tipoServico) : false
  })

  if (combos.length >= 1) {
    return [combos[0]]
  }

  return [...new Set(filtrados)]
}
