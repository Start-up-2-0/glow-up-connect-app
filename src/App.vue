<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AgendarPublicoLayout from '@/layouts/AgendarPublicoLayout.vue'
import LandingLayout from '@/layouts/LandingLayout.vue'
import ToastContainer from '@/components/feedback/ToastContainer.vue'

const route = useRoute()

const layout = computed(() => {
  if (route.meta.layout === 'dashboard') return DashboardLayout
  if (route.meta.layout === 'landing') return LandingLayout
  if (route.meta.layout === 'agendar-publico') return AgendarPublicoLayout
  if (route.meta.layout === 'public') return PublicLayout
  return AuthLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
  <ToastContainer />
</template>
