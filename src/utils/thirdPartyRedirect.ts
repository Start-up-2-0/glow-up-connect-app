import { useConsentStore } from '@/stores/consent.store'

export function redirectToThirdPartyUrl(url: string): boolean {
  const consentStore = useConsentStore()
  if (!consentStore.hasThirdPartyConsent) {
    consentStore.openPreferences()
    return false
  }

  window.location.href = url
  return true
}
