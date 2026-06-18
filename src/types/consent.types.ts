export type ConsentCategory = 'essential' | 'thirdPartyServices' | 'analytics'

export interface CookieConsentPreferences {
  version: string
  decidedAt: string | null
  essential: true
  thirdPartyServices: boolean
  analytics: boolean
}

export interface TermsAcceptance {
  version: string
  acceptedAt: string
}

export interface ThirdPartyProviderInfo {
  id: string
  name: string
  purpose: string
  dataShared: string
  privacyUrl: string
}
