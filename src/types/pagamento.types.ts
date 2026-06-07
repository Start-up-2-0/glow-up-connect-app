import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'

export type MetodoPagamentoAssinatura = 'cartao' | 'pix'

export function criarPagamentoPix(identificationNumber: string): PagamentoAssinaturaPayload {
  return {
    paymentMethodId: 'pix',
    token: '',
    identificationType: 'CPF',
    identificationNumber: identificationNumber.replace(/\D/g, ''),
  }
}

export function isPagamentoPix(pagamento: PagamentoAssinaturaPayload): boolean {
  return pagamento.paymentMethodId.toLowerCase() === 'pix'
}
