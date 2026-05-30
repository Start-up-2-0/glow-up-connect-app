<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="flex h-screen">
    <div v-if="appStore.sidebarOpen" @click="appStore.setSidebarOpen(false)" />

    <AppSidebar
      :class="appStore.sidebarOpen ? '' : 'hidden lg:block'"
    />

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AppNavbar @toggle-sidebar="appStore.toggleSidebar()" />
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
