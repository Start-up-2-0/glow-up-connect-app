import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { useAppStore } from './stores/app.store'
import { useConsentStore } from './stores/consent.store'
import { registerSessionSyncCallback } from './utils/sessionSync'
import { registerChunkLoadRecovery } from './utils/chunkLoadError'
import { startSessionRefreshScheduler } from './composables/useSessionRefresh'
import { registerAppLifecycleRecovery } from './composables/useAppLifecycleRecovery'
import { MOCK_MODE } from './mocks/config'
import './assets/main.css'

function scheduleIdleWork(fn: () => void, timeout = 2500): void {
  if (typeof window === 'undefined') return
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
  ).requestIdleCallback
  if (typeof ric === 'function') {
    ric(fn, { timeout })
  } else {
    window.setTimeout(fn, 1)
  }
}

registerChunkLoadRecovery()
registerAppLifecycleRecovery()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const appStore = useAppStore(pinia)
appStore.hydrateTheme()

const consentStore = useConsentStore(pinia)
consentStore.hydrate()

const authStore = useAuthStore(pinia)
authStore.hydrateFromStorage()

registerSessionSyncCallback((tokens) => {
  authStore.applySession(tokens, { persist: false })
})

if (authStore.isAuthenticated) {
  startSessionRefreshScheduler()
}

// Proof pool não deve competir com o first paint — aquece em idle.
if (!MOCK_MODE) {
  scheduleIdleWork(() => {
    void import('./composables/useRequestProof').then(({ ensureRequestProofPool }) => {
      void ensureRequestProofPool()
    })
  })
}

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[glow-up-connect] VITE_API_BASE_URL não definida')
}

const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api'
if (
  import.meta.env.PROD &&
  /^https?:\/\//i.test(apiBase) &&
  !apiBase.startsWith(window.location.origin)
) {
  console.error(
    '[glow-up-connect] VITE_API_BASE_URL aponta para outro domínio em produção.',
    'Use /api (same-origin via Caddy) e faça rebuild do App no Railway.',
    { apiBase, origin: window.location.origin },
  )
}

app.mount('#app')
