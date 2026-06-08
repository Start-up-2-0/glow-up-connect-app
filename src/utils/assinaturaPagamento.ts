import type { Assinatura } from '@/types/assinatura.types'

export type ResultadoPagamentoAssinatura = 'trial' | 'dashboard' | 'checkout' | 'pix' | 'poll'

export function classificarRespostaPagamento(result: Assinatura): ResultadoPagamentoAssinatura {
  if (result.emTrial) {
    return 'trial'
  }

  if (result.status === 'PendentePagamento') {
    const qr = result.pagamentoInicial?.qrCode?.trim()
    if (qr) {
      return 'pix'
    }
    if (result.pagamentoInicial?.checkoutUrl) {
      return 'checkout'
    }
    return 'poll'
  }

  return 'dashboard'
}

export function qrCodeParaExibicao(qrCode: string): { tipo: 'imagem' | 'copia-cola'; valor: string } {
  const valor = qrCode.trim()
  if (valor.startsWith('data:image')) {
    return { tipo: 'imagem', valor }
  }
  if (/^[A-Za-z0-9+/=]+$/.test(valor) && valor.length > 200) {
    return { tipo: 'imagem', valor: `data:image/png;base64,${valor}` }
  }
  return { tipo: 'copia-cola', valor }
}
