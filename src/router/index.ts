import { createRouter, createWebHistory } from 'vue-router'
import { APP_NAME } from '@/constants/storageKeys'
import { useLoadingStore } from '@/stores/loading.store'
import { authGuard } from './guards/auth.guard'
import { negocioGuard } from './guards/negocio.guard'
import { authRoutes } from './routes/auth.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { clienteRoutes } from './routes/cliente.routes'
import { onboardingRoutes } from './routes/onboarding.routes'
import { configuracoesRoutes } from './routes/configuracoes.routes'
import { modulosRoutes } from './routes/modulos.routes'
import { publicRoutes } from './routes/public.routes'
import { devRoutes } from './routes/dev.routes'
import { notFoundRoutes } from './routes/notFound.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...devRoutes,
    ...authRoutes,
    ...dashboardRoutes,
    ...onboardingRoutes,
    ...configuracoesRoutes,
    ...modulosRoutes,
    ...clienteRoutes,
    ...notFoundRoutes,
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, top: 88, behavior: 'smooth' }
    }
    return { top: 0, left: 0 }
  },
})

// Loading global de navegação: mostra ao iniciar e esconde quando resolver (ou errar).
router.beforeEach(() => {
  useLoadingStore().navigationStart('Preparando sua experiência...')
  return true
})
router.beforeEach(authGuard)
router.beforeEach(negocioGuard)

router.afterEach((to) => {
  useLoadingStore().navigationEnd()
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  if (!to.hash) {
    window.scrollTo(0, 0)
  }
})

router.onError(() => {
  useLoadingStore().navigationEnd()
})

export default router
