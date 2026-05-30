# Snippets de código — glow-up-connect-app

> **Implementação real:** os arquivos em `src/` são a fonte de verdade.
> API: `http://localhost:5127`, header `x-glow-token`, campos PT (`senha`, `usuario`).

Exemplos de referência. Adaptar conforme necessário.

---

## `src/main.ts`

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import './assets/main.css'

// Flowbite JS (tooltips, dropdowns, etc.)
import 'flowbite'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaurar sessão antes do primeiro render
const authStore = useAuthStore(pinia)
authStore.hydrateFromStorage()

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[glow-up-connect] VITE_API_BASE_URL não definida')
}

app.mount('#app')
```

---

## `src/constants/storageKeys.ts`

```ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'guc_auth_token',
} as const
```

---

## `src/constants/routes.ts`

```ts
export const ROUTE_NAMES = {
  LANDING: 'landing',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD_HOME: 'dashboard-home',
} as const

export const ROUTE_PATHS = {
  LANDING: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
} as const
```

---

## `src/utils/storage.ts`

```ts
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // quota exceeded ou modo privado
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // noop
    }
  },
}
```

---

## `src/types/api.types.ts`

```ts
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}
```

---

## `src/types/user.types.ts`

```ts
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: string
}
```

---

## `src/types/auth.types.ts`

```ts
import type { User } from './user.types'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthData {
  token: string
  user: User
}

export type AuthResponse = ApiResponse<AuthData>

import type { ApiResponse } from './api.types'
```

---

## `src/services/api.ts`

```ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '@/types/api.types'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { storage } from '@/utils/storage'
import { ROUTE_PATHS } from '@/constants/routes'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

// Request: injeta token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.get(STORAGE_KEYS.AUTH_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response: trata 401 globalmente
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN)

      // Evita loop se já estiver na página de login
      const isAuthRoute = window.location.pathname.startsWith('/auth')
      if (!isAuthRoute) {
        const redirect = encodeURIComponent(window.location.pathname)
        window.location.href = `${ROUTE_PATHS.LOGIN}?redirect=${redirect}`
      }
    }
    return Promise.reject(error)
  },
)

export default api
export type { ApiErrorResponse }
```

---

## `src/services/authService.ts`

```ts
import api from './api'
import type { LoginPayload, AuthResponse } from '@/types/auth.types'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'

export const authService = {
  login(payload: LoginPayload) {
    return api.post<AuthResponse>('/auth/login', payload)
  },

  me() {
    return api.get<ApiResponse<User>>('/auth/me')
  },

  logout() {
    return api.post('/auth/logout')
  },
}
```

---

## `src/services/index.ts`

```ts
export { default as api } from './api'
export { authService } from './authService'
export { userService } from './userService'
```

---

## `src/stores/auth.store.ts`

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useUserStore } from './user.store'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { storage } from '@/utils/storage'
import type { LoginPayload } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(value: string | null) {
    token.value = value
    if (value) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, value)
    } else {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN)
    }
  }

  function hydrateFromStorage() {
    const stored = storage.get(STORAGE_KEYS.AUTH_TOKEN)
    if (stored) token.value = stored
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.login(payload)
      setToken(data.data.token)
      useUserStore().setUser(data.data.user)
    } catch (err) {
      error.value = 'Credenciais inválidas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // logout local mesmo se API falhar
    } finally {
      setToken(null)
      useUserStore().clear()
    }
  }

  return {
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    hydrateFromStorage,
    setToken,
  }
})
```

---

## `src/stores/user.store.ts`

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/services/authService'
import type { User } from '@/types/user.types'

export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null)
  const loading = ref(false)

  function setUser(user: User | null) {
    profile.value = user
  }

  function clear() {
    profile.value = null
  }

  async function fetchMe(force = false) {
    if (profile.value && !force) return profile.value
    loading.value = true
    try {
      const { data } = await authService.me()
      profile.value = data.data
      return profile.value
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, setUser, clear, fetchMe }
})
```

---

## `src/stores/app.store.ts`

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(true)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(value: boolean) {
    sidebarOpen.value = value
  }

  return { sidebarOpen, toggleSidebar, setSidebarOpen }
})
```

---

## `src/router/guards/auth.guard.ts`

```ts
import type { NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTE_PATHS } from '@/constants/routes'

export const authGuard: NavigationGuardWithThis<undefined> = (to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth === true
  const guestOnly = to.meta.guestOnly === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: ROUTE_PATHS.LOGIN,
      query: { redirect: to.fullPath },
    })
  }

  if (guestOnly && authStore.isAuthenticated) {
    return next({ path: ROUTE_PATHS.DASHBOARD })
  }

  next()
}
```

---

## `src/router/routes/auth.routes.ts`

```ts
import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.LOGIN,
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Entrar' },
  },
  {
    path: ROUTE_PATHS.REGISTER,
    name: ROUTE_NAMES.REGISTER,
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { layout: 'auth', guestOnly: true, title: 'Cadastro' },
  },
]
```

---

## `src/router/routes/dashboard.routes.ts`

```ts
import type { RouteRecordRaw } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    meta: { layout: 'dashboard', requiresAuth: true },
    children: [
      {
        path: '',
        name: ROUTE_NAMES.DASHBOARD_HOME,
        component: () => import('@/views/dashboard/DashboardHomeView.vue'),
        meta: { title: 'Dashboard' },
      },
    ],
  },
]
```

---

## `src/router/index.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth.guard'
import { publicRoutes } from './routes/public.routes'
import { authRoutes } from './routes/auth.routes'
import { dashboardRoutes } from './routes/dashboard.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...authRoutes, ...dashboardRoutes],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(authGuard)

router.afterEach((to) => {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Glow Up Connect'
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | ${appName}` : appName
})

export default router
```

---

## `src/App.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const route = useRoute()

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'auth':
      return AuthLayout
    case 'dashboard':
      return DashboardLayout
    default:
      return PublicLayout
  }
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
```

---

## `src/layouts/DashboardLayout.vue`

```vue
<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar desktop -->
    <AppSidebar
      class="hidden lg:flex"
      :open="appStore.sidebarOpen"
    />

    <!-- Drawer mobile -->
    <Transition name="fade">
      <div
        v-if="appStore.sidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        @click="appStore.setSidebarOpen(false)"
      />
    </Transition>
    <AppSidebar
      class="fixed inset-y-0 left-0 z-50 lg:hidden transition-transform"
      :class="appStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      :open="appStore.sidebarOpen"
      mobile
    />

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppNavbar @toggle-sidebar="appStore.toggleSidebar" />
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

---

## `src/layouts/AuthLayout.vue`

```vue
<script setup lang="ts">
const appName = import.meta.env.VITE_APP_NAME ?? 'Glow Up Connect'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ appName }}</h1>
        <p class="mt-1 text-sm text-gray-500">Acesse sua conta</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <slot />
      </div>
    </div>
  </div>
</template>
```

---

## `src/composables/useAuth.ts`

```ts
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'
import type { LoginPayload } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const router = useRouter()
  const { isAuthenticated, loading, error } = storeToRefs(authStore)
  const { profile } = storeToRefs(userStore)

  async function login(payload: LoginPayload, redirect?: string) {
    await authStore.login(payload)
    await router.push(redirect ?? ROUTE_PATHS.DASHBOARD)
  }

  async function logout() {
    await authStore.logout()
    await router.push(ROUTE_PATHS.LOGIN)
  }

  return { isAuthenticated, loading, error, profile, login, logout }
}
```

---

## `src/composables/useFetchOnce.ts`

```ts
import { ref } from 'vue'

const inflight = new Map<string, Promise<unknown>>()

export function useFetchOnce<T>(key: string, fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  async function execute(force = false) {
    if (data.value && !force) return data.value

    if (inflight.has(key) && !force) {
      return inflight.get(key) as Promise<T>
    }

    loading.value = true
    error.value = null

    const promise = fetcher()
      .then((result) => {
        data.value = result
        return result
      })
      .catch((err) => {
        error.value = err
        throw err
      })
      .finally(() => {
        loading.value = false
        inflight.delete(key)
      })

    inflight.set(key, promise)
    return promise
  }

  return { data, loading, error, execute }
}
```

---

## `src/components/ui/BaseButton.vue`

```vue
<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  },
)

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-300',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
    :class="[variantClasses[variant], sizeClasses[size]]"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
```

---

## `src/components/ui/BaseInput.vue`

```vue
<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>
```

---

## `tailwind.config.js`

```js
import flowbite from 'flowbite/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
        },
      },
    },
  },
  plugins: [flowbite],
}
```

---

## `vite.config.ts`

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```
