import { useConsentStore } from '@/stores/consent.store'

export type ThirdPartyOpenResult = 'denied' | 'new-tab' | 'same-tab'

export function openThirdPartyUrl(url: string): ThirdPartyOpenResult {
  const consentStore = useConsentStore()
  if (!consentStore.hasThirdPartyConsent) {
    consentStore.openPreferences()
    return 'denied'
  }

  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  if (popup == null || popup.closed) {
    window.location.href = url
    return 'same-tab'
  }

  return 'new-tab'
}

/** @deprecated Use openThirdPartyUrl para distinguir nova aba vs mesma aba. */
export function redirectToThirdPartyUrl(url: string): boolean {
  return openThirdPartyUrl(url) !== 'denied'
}
