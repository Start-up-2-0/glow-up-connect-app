/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.webp' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_APP_NAME: string
  readonly VITE_TOKEN_HEADER: string
  readonly VITE_MP_PUBLIC_KEY?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_CAPTCHA_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
