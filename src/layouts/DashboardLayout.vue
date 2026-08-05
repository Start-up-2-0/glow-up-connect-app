<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import AppShellSidebar from '@/components/shell/AppShellSidebar.vue'
import AppShellTopbar from '@/components/shell/AppShellTopbar.vue'
import UpgradeModal from '@/components/access/UpgradeModal.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="min-h-dvh bg-glow-canvas antialiased text-glow-text">
    <AppShellTopbar />

    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="appStore.sidebarOpen"
        class="fixed inset-0 z-30 bg-[rgba(13,8,37,0.55)] backdrop-blur-[1px] md:hidden"
        aria-hidden="true"
        @click="appStore.setSidebarOpen(false)"
      />
    </Transition>

    <AppShellSidebar />

    <main class="min-h-dvh overflow-x-hidden p-4 pt-16 md:ml-64">
      <div class="w-full">
        <slot />
      </div>
    </main>

    <UpgradeModal />
  </div>
</template>
