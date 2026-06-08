<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import UpgradeModal from '@/components/access/UpgradeModal.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="dashboard-shell flex h-dvh min-h-0 overflow-hidden bg-glow-canvas">
    <AppSidebar class="hidden h-dvh min-h-0 shrink-0 lg:flex" />

    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="appStore.sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        aria-hidden="true"
        @click="appStore.setSidebarOpen(false)"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
    >
      <AppSidebar
        v-if="appStore.sidebarOpen"
        mobile
        class="fixed inset-y-0 left-0 z-50 lg:hidden"
      />
    </Transition>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <AppNavbar class="shrink-0" @toggle-sidebar="appStore.toggleSidebar()" />
      <main class="dashboard-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div class="dashboard-main__inner">
          <slot />
        </div>
      </main>
    </div>
    <UpgradeModal />
  </div>
</template>
