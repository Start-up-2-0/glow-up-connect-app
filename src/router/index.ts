import { createRouter, createWebHistory } from 'vue-router'
import { APP_NAME } from '@/constants/storageKeys'
import { ROUTE_PATHS } from '@/constants/routes'
import { authGuard } from './guards/auth.guard'
import { negocioGuard } from './guards/negocio.guard'
import { authRoutes } from './routes/auth.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { clienteRoutes } from './routes/cliente.routes'
import { onboardingRoutes } from './routes/onboarding.routes'
import { configuracoesRoutes } from './routes/configuracoes.routes'
import { modulosRoutes } from './routes/modulos.routes'
import { notFoundRoutes } from './routes/notFound.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTE_PATHS.HOME,
      redirect: ROUTE_PATHS.LOGIN,
    },
    ...authRoutes,
    ...dashboardRoutes,
    ...onboardingRoutes,
    ...configuracoesRoutes,
    ...modulosRoutes,
    ...clienteRoutes,
    ...notFoundRoutes,
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
})

router.beforeEach(authGuard)
router.beforeEach(negocioGuard)

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  window.scrollTo(0, 0)
})

export default router
