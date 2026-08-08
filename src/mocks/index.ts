import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { MockRouter, resolveMockPath, type MockRequest } from './match'
import { MOCK_LATENCY_MS } from './config'
import { delay } from './response'
import { mockEstablishmentsForEmail } from './seed/usuario'
import { registerCoreRoutes } from './handlers/core'
import { registerFinanceiroRoutes } from './handlers/financeiro'
import { registerCatalogoRoutes } from './handlers/catalogo'
import { registerAgendaRoutes } from './handlers/agenda'
import { registerPublicoRoutes } from './handlers/publico'

const SESSION_EMAIL_KEY = 'guc_mock_email'

/** Id de estabelecimento presente na URL (rotas de negócio `/estabelecimentos/{id}/...`). */
function establishmentIdInPath(path: string): number | null {
  const m = /^\/estabelecimentos\/(\d+)(?:\/|$)/.exec(path)
  return m ? Number(m[1]) : null
}

let router: MockRouter | null = null

function buildRouter(): MockRouter {
  const r = new MockRouter()
  registerCoreRoutes(r)
  registerFinanceiroRoutes(r)
  registerCatalogoRoutes(r)
  registerAgendaRoutes(r)
  registerPublicoRoutes(r)
  return r
}

function parseBody(data: unknown): unknown {
  if (typeof data !== 'string' || data.length === 0) return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

export function getMockAdapter() {
  if (!router) router = buildRouter()
  const activeRouter = router

  return async function mockAdapter(
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const method = (config.method ?? 'get').toLowerCase()
    const path = resolveMockPath(config.url)
    const req: MockRequest = {
      method,
      path,
      params: {},
      query: (config.params as Record<string, string>) ?? {},
      body: parseBody(config.data),
    }

    // Autorização central: restringe acesso a filiais ao escopo do perfil logado.
    const estabId = establishmentIdInPath(path)
    if (estabId !== null) {
      const email = sessionStorage.getItem(SESSION_EMAIL_KEY) ?? ''
      if (email) {
        const allowed = mockEstablishmentsForEmail(email).some(
          (e) => e.estabelecimentoId === estabId,
        )
        if (!allowed) {
          await delay(MOCK_LATENCY_MS)
          return {
            data: {
              success: false,
              message: `Sem acesso à filial ${estabId} para a conta atual.`,
              code: 'FORBIDDEN',
            },
            status: 403,
            statusText: 'Forbidden',
            headers: { 'content-type': 'application/json' },
            config,
            request: {},
          }
        }
      }
    }

    const body = activeRouter.handle(req)

    let status = 200
    let data: unknown = body

    if (body === undefined) {
      status = 501
      data = { success: false, message: `Sem handler mock para ${method.toUpperCase()} ${path}`, code: 'NOT_IMPLEMENTED' }
      console.warn(`[mock] SEM HANDLER: ${method.toUpperCase()} ${path}`)
    } else if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as { success?: boolean }).success === false &&
      'status' in body &&
      typeof (body as { status?: unknown }).status === 'number'
    ) {
      status = (body as { status: number }).status
    }

    await delay(MOCK_LATENCY_MS)

    return {
      data,
      status,
      statusText: status >= 400 ? 'Error' : status === 501 ? 'Not Implemented' : 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    }
  }
}

/**
 * Registra o adapter mock no request interceptor quando MOCK_MODE está ativo.
 * Chamado em main.ts. Fora do modo mock, não faz nada.
 */
export { MOCK_MODE } from './config'
