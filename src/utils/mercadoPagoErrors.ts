export function extrairErroMercadoPago(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message
  }

  if (err && typeof err === 'object') {
    const payload = err as {
      message?: string
      error?: string
      cause?: Array<{ description?: string; code?: string }>
    }

    const causa = payload.cause?.find((item) => item.description?.trim())
    if (causa?.description) {
      return causa.description
    }

    if (payload.message?.trim()) {
      return payload.message
    }

    if (payload.error?.trim()) {
      return payload.error
    }
  }

  return 'Não foi possível validar o cartão. Verifique os dados e tente novamente.'
}

export type MercadoPagoCtor = new (
  publicKey: string,
  options?: { locale?: string },
) => {
  createCardToken: (data: Record<string, string>) => Promise<{
    id: string
    payment_method_id?: string
  }>
}

export function obterMercadoPagoCtor(): MercadoPagoCtor | null {
  const ctor = (window as Window & { MercadoPago?: MercadoPagoCtor }).MercadoPago
  return ctor ?? null
}
