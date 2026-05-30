<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ToastContainer from '@/components/feedback/ToastContainer.vue'

const route = useRoute()

const layout = computed(() => {
  return route.meta.layout === 'dashboard' ? DashboardLayout : AuthLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
  <ToastContainer />
</template>
