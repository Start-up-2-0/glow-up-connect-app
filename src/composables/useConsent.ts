import { storeToRefs } from 'pinia'
import { useConsentStore } from '@/stores/consent.store'

export function useConsent() {
  const store = useConsentStore()
  const {
    hasThirdPartyConsent,
    hasTermsAccepted,
    showBanner,
    preferencesModalOpen,
  } = storeToRefs(store)

  function requireThirdPartyConsent(): boolean {
    if (store.hasThirdPartyConsent) return true
    store.openPreferences()
    return false
  }

  return {
    hasThirdPartyConsent,
    hasTermsAccepted,
    showBanner,
    preferencesModalOpen,
    acceptAll: store.acceptAll,
    rejectNonEssential: store.rejectNonEssential,
    savePreferences: store.savePreferences,
    acceptTerms: store.acceptTerms,
    openPreferences: store.openPreferences,
    closePreferences: store.closePreferences,
    revokeThirdPartyConsent: store.revokeThirdPartyConsent,
    requireThirdPartyConsent,
  }
}
