<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNegocioStore } from '@/stores/negocio.store'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DevPreviewLayout from '@/layouts/DevPreviewLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AgendarPublicoLayout from '@/layouts/AgendarPublicoLayout.vue'
import ToastContainer from '@/components/feedback/ToastContainer.vue'
import GlobalLoader from '@/components/loading/GlobalLoader.vue'
import CookieConsentBanner from '@/components/legal/CookieConsentBanner.vue'
import CookiePreferencesModal from '@/components/legal/CookiePreferencesModal.vue'
import { useConsent } from '@/composables/useConsent'
import { ROUTE_NAMES } from '@/constants/routes'

const route = useRoute()
const authStore = useAuthStore()
const negocioStore = useNegocioStore()
const { estabelecimentoIdSelecionado, contextoVersao } = storeToRefs(negocioStore)
const { showBanner } = useConsent()

const layout = computed(() => {
  if (
    route.name === ROUTE_NAMES.LOJA_AGENDAR
    && authStore.isAuthenticated
  ) {
    return DashboardLayout
  }
  if (route.meta.layout === 'dev-preview') return DevPreviewLayout
  if (route.meta.layout === 'dashboard') return DashboardLayout
  if (route.meta.layout === 'agendar-publico') return AgendarPublicoLayout
  if (route.meta.layout === 'public') return PublicLayout
  return AuthLayout
})

const routerViewKey = computed(() => {
  const usaContextoNegocio =
    route.meta.layout === 'dashboard'
    || (route.name === ROUTE_NAMES.LOJA_AGENDAR && authStore.isAuthenticated)

  if (!usaContextoNegocio) {
    return route.fullPath
  }

  const estabelecimentoId = estabelecimentoIdSelecionado.value ?? 'none'
  return `ctx-${estabelecimentoId}-${contextoVersao.value}`
})
</script>

<template>
  <component :is="layout">
    <router-view :key="routerViewKey" />
  </component>
  <ToastContainer />
  <GlobalLoader />
  <CookieConsentBanner v-if="showBanner" />
  <CookiePreferencesModal />
</template>
