import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { registerSessionSyncCallback } from './utils/sessionSync'
import { startSessionRefreshScheduler } from './composables/useSessionRefresh'
import './assets/main.css'
import 'flowbite'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.hydrateFromStorage()

registerSessionSyncCallback((tokens) => {
  authStore.applySession(tokens, { persist: false })
})

if (authStore.isAuthenticated) {
  startSessionRefreshScheduler()
}

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[glow-up-connect] VITE_API_BASE_URL não definida')
}

app.mount('#app')
