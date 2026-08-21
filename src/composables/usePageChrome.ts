import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { resolvePageChrome } from '@/constants/pageChrome'
import { ROUTE_PATHS } from '@/constants/routes'
import { useUserStore } from '@/stores/user.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { isClienteRole } from '@/types/user.types'

export function usePageChrome() {
  const route = useRoute()
  const { profile } = storeToRefs(useUserStore())
  const { temVinculoNegocio, ehProfissionalOperacional } = useAcessoUsuario()

  const chrome = computed(() => {
    const base = resolvePageChrome(route.path, route.meta.title as string | undefined)

    if (route.path === ROUTE_PATHS.DASHBOARD) {
      if (ehProfissionalOperacional.value) {
        return {
          ...base,
          title: 'Meu trabalho',
          description: 'Sua agenda e desempenho do dia.',
          crumbs: [{ label: 'Início' }],
        }
      }
      if (temVinculoNegocio.value) {
        return {
          ...base,
          title: 'Dashboard',
          description: 'Acompanhe o desempenho da sua loja em tempo real.',
          crumbs: [{ label: 'Dashboard' }],
        }
      }
      if (isClienteRole(profile.value?.role)) {
        return {
          ...base,
          title: 'Início',
          description: 'Seu próximo horário e recomendações perto de você.',
          crumbs: [{ label: 'Início' }],
        }
      }
    }

    return base
  })

  const title = computed(() => chrome.value.title)
  const description = computed(() => chrome.value.description)
  const crumbs = computed(() => chrome.value.crumbs ?? [{ label: chrome.value.title }])

  return { chrome, title, description, crumbs }
}
