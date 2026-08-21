<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useNegocioStore } from '@/stores/negocio.store'
import ToastContainer from '@/components/feedback/ToastContainer.vue'
import GlobalLoader from '@/components/loading/GlobalLoader.vue'
import CookieConsentBanner from '@/components/legal/CookieConsentBanner.vue'
import CookiePreferencesModal from '@/components/legal/CookiePreferencesModal.vue'
import { useConsent } from '@/composables/useConsent'
import { ROUTE_NAMES } from '@/constants/routes'

const AuthLayout = defineAsyncComponent(() => import('@/layouts/AuthLayout.vue'))
const DevPreviewLayout = defineAsyncComponent(() => import('@/layouts/DevPreviewLayout.vue'))
const DashboardLayout = defineAsyncComponent(() => import('@/layouts/DashboardLayout.vue'))
const PublicLayout = defineAsyncComponent(() => import('@/layouts/PublicLayout.vue'))
const AgendarPublicoLayout = defineAsyncComponent(() => import('@/layouts/AgendarPublicoLayout.vue'))
const GlowGuideHost = defineAsyncComponent(() => import('@/tutorials/components/GlowGuideHost.vue'))

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

const showGlowGuide = computed(() => {
  return (
    route.meta.layout === 'dashboard'
    || (route.name === ROUTE_NAMES.LOJA_AGENDAR && authStore.isAuthenticated)
  )
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
  <GlowGuideHost v-if="showGlowGuide" />
  <CookieConsentBanner v-if="showBanner" />
  <CookiePreferencesModal />
</template>
