import { useConsentStore } from '@/stores/consent.store'

export type ThirdPartyOpenResult = 'denied' | 'new-tab' | 'same-tab'

export function openThirdPartyUrl(url: string): ThirdPartyOpenResult {
  const consentStore = useConsentStore()
  if (!consentStore.hasThirdPartyConsent) {
    consentStore.openPreferences()
    return 'denied'
  }

  // Não usar 'noopener' em window.open: no Chromium o retorno fica null mesmo
  // com a aba aberta, e o fallback navegaria esta página também.
  const popup = window.open(url, '_blank')
  if (!popup) {
    window.location.href = url
    return 'same-tab'
  }

  popup.opener = null
  return 'new-tab'
}

/** @deprecated Use openThirdPartyUrl para distinguir nova aba vs mesma aba. */
export function redirectToThirdPartyUrl(url: string): boolean {
  return openThirdPartyUrl(url) !== 'denied'
}
