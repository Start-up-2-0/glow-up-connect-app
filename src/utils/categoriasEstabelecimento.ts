import type { TipoAssinatura } from '@/types/assinatura.types'
import type { EstabelecimentoCategoria } from '@/types/estabelecimento.types'

export function categoriasDoTipo(
  categorias: readonly EstabelecimentoCategoria[],
  tipo: TipoAssinatura,
): EstabelecimentoCategoria[] {
  return categorias.filter(
    (categoria) => !categoria.tipoAssinatura || categoria.tipoAssinatura === tipo,
  )
}

export function opcoesCategoriaDoTipo(
  categorias: readonly EstabelecimentoCategoria[],
  tipo: TipoAssinatura,
): Array<{ value: string; label: string }> {
  return categoriasDoTipo(categorias, tipo).map((categoria) => ({
    value: String(categoria.id),
    label: categoria.nome,
  }))
}

export function placeholderCategoria(tipo: TipoAssinatura): string {
  return tipo === 'ProfissionalAutonomo'
    ? 'Barbeiro ou cabeleireiro(a)'
    : 'Barbearia ou salão de beleza'
}

export function sugerirCategoriaId(
  categorias: readonly EstabelecimentoCategoria[],
  tipo: TipoAssinatura,
  atual?: string,
): string {
  if (atual && categoriasDoTipo(categorias, tipo).some((c) => String(c.id) === atual)) {
    return atual
  }
  const opcoes = categoriasDoTipo(categorias, tipo)
  return opcoes.length === 1 ? String(opcoes[0].id) : ''
}
