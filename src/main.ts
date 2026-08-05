import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { useAppStore } from './stores/app.store'
import { useConsentStore } from './stores/consent.store'
import { registerSessionSyncCallback } from './utils/sessionSync'
import { startSessionRefreshScheduler } from './composables/useSessionRefresh'
import { ensureRequestProofPool } from './composables/useRequestProof'
import { MOCK_MODE } from './mocks/config'
import './assets/main.css'
import 'flowbite'

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

if (!MOCK_MODE) {
  void ensureRequestProofPool()
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
