import type { NavigationGuard } from 'vue-router'

/**
 * Força reload completo do browser em troca de rota (em vez de navegação SPA).
 */
export const hardReloadGuard: NavigationGuard = (to, from) => {
  if (!from.name || to.path === from.path) {
    return true
  }

  window.location.assign(to.fullPath)
  return false
}
