import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim() || 'http://localhost:5127'
  const glowProxySecret = env.GLOW_PROXY_SECRET?.trim()

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          cookieDomainRewrite: 'localhost',
          configure: (proxy) => {
            if (!glowProxySecret) return
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Glow-Proxy-Secret', glowProxySecret)
            })
          },
        },
        '/health': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
