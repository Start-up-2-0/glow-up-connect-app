/**
 * Roteador de mocks: casa `method + path` contra rotas registradas,
 * extrai parâmetros de caminho (ex.: `/estabelecimentos/:id`) e devolve
 * o body da resposta para o adapter mock.
 */

export interface MockRequest {
  method: string
  path: string
  params: Record<string, string>
  query: Record<string, string>
  body: unknown
}

export interface RouteDef {
  method: string
  regex: RegExp
  paramNames: string[]
  handler: (req: MockRequest) => unknown
}

function escapeRegex(segment: string): string {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Transforma `/estabelecimentos/:id/financeiro/metas` em RegExp com grupos nomeados. */
function compilePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const parts = pattern.split('/').filter(Boolean)

  const source = parts
    .map((part) => {
      if (part.startsWith(':')) {
        const name = part.slice(1)
        paramNames.push(name)
        return '([^/]+)'
      }
      return escapeRegex(part)
    })
    .join('/')

  return { regex: new RegExp(`^/${source}$`), paramNames }
}

/** Remove `/api`, query string e barras finais; mantém o case original. */
export function resolveMockPath(url?: string): string {
  const withoutQuery = (url ?? '').split('?')[0]
  const normalized = withoutQuery.replace(/\/+$/, '')
  if (normalized.startsWith('/api')) {
    return normalized.slice(4).replace(/^/, '')
  }
  return normalized
}

export class MockRouter {
  private routes: RouteDef[] = []

  on(method: string, pattern: string, handler: (req: MockRequest) => unknown): this {
    const { regex, paramNames } = compilePattern(pattern)
    this.routes.push({ method: method.toLowerCase(), regex, paramNames, handler })
    return this
  }

  handle(req: MockRequest): unknown {
    const method = req.method.toLowerCase()
    for (const route of this.routes) {
      if (route.method !== method) continue
      const match = route.regex.exec(req.path)
      if (!match) continue

      const params: Record<string, string> = {}
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
      })

      return route.handler({ ...req, params })
    }
    return undefined
  }
}