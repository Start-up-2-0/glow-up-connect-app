import type { NavChildItem, NavItem } from '@/constants/navigation'

export interface NavFilterContext {
  assinaturaAtiva: boolean
  possuiModulo: (modulo: string) => boolean
  possuiPermissao: (permissao: string) => boolean
  possuiAlgumModulo: (modulos: string[]) => boolean
  possuiAlgumaPermissao: (permissoes: string[]) => boolean
}

function itemPermitido(
  item: Pick<
    NavItem,
    | 'requerModulo'
    | 'requerModulos'
    | 'requerSemModulo'
    | 'requerPermissao'
    | 'requerPermissoes'
    | 'requerAssinatura'
  >,
  context: NavFilterContext,
): boolean {
  if (item.requerAssinatura !== false && !context.assinaturaAtiva) {
    const temRequisito =
      item.requerModulo ||
      item.requerModulos?.length ||
      item.requerPermissao ||
      item.requerPermissoes?.length

    if (temRequisito) return false
  }

  if (item.requerSemModulo && context.possuiModulo(item.requerSemModulo)) {
    return false
  }

  if (item.requerModulo && !context.possuiModulo(item.requerModulo)) {
    return false
  }

  if (item.requerModulos?.length && !context.possuiAlgumModulo(item.requerModulos)) {
    return false
  }

  if (item.requerPermissao && !context.possuiPermissao(item.requerPermissao)) {
    return false
  }

  if (item.requerPermissoes?.length && !context.possuiAlgumaPermissao(item.requerPermissoes)) {
    return false
  }

  return true
}

function filtrarFilhos(children: NavChildItem[], context: NavFilterContext): NavChildItem[] {
  return children.filter((child) => itemPermitido(child, context))
}

export function filterNavItems(navItems: NavItem[], context: NavFilterContext): NavItem[] {
  return navItems
    .map((item) => {
      if (item.children?.length) {
        const children = filtrarFilhos(item.children, context)
        if (children.length === 0) return null
        return { ...item, children }
      }
      return itemPermitido(item, context) ? item : null
    })
    .filter((item): item is NavItem => item !== null)
}
