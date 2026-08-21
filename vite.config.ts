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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/vue/') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')
            ) {
              return 'vue-vendor'
            }
            if (id.includes('node_modules/axios')) {
              return 'http-vendor'
            }
            if (id.includes('node_modules/leaflet')) {
              return 'map-vendor'
            }
            if (id.includes('node_modules/chart.js') || id.includes('node_modules/vue-chartjs')) {
              return 'chart-vendor'
            }
          },
        },
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
