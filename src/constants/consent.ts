import type { ThirdPartyProviderInfo } from '@/types/consent.types'

export const CONSENT_POLICY_VERSION = '1.0'
export const TERMS_VERSION = '1.0'

export const CONSENT_STORAGE_KEYS = {
  COOKIE_PREFERENCES: 'guc_cookie_consent',
  TERMS_ACCEPTANCE: 'guc_terms_acceptance',
} as const

export const THIRD_PARTY_PROVIDERS: ThirdPartyProviderInfo[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    purpose: 'Processamento de pagamentos (cartão, PIX e Checkout Pro).',
    dataShared: 'Dados de pagamento, identificação do titular e informações da transação.',
    privacyUrl: 'https://www.mercadopago.com.br/privacidade',
  },
  {
    id: 'viacep',
    name: 'ViaCEP',
    purpose: 'Preenchimento automático de endereço a partir do CEP.',
    dataShared: 'Número do CEP consultado.',
    privacyUrl: 'https://viacep.com.br/',
  },
  {
    id: 'brasilapi',
    name: 'BrasilAPI',
    purpose: 'Consulta alternativa de endereço por CEP quando o ViaCEP não responde.',
    dataShared: 'Número do CEP consultado.',
    privacyUrl: 'https://brasilapi.com.br/',
  },
]
