<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import AppSidebar from '@/components/layout/AppSidebar.vue'
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

    <div class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <button
        v-if="!appStore.sidebarOpen"
        type="button"
        class="absolute left-4 top-4 z-30 flex size-10 items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text lg:hidden"
        aria-label="Abrir menu"
        @click="appStore.toggleSidebar()"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 6H16M4 10H16M4 14H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <main class="dashboard-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div class="dashboard-main__inner">
          <slot />
        </div>
      </main>
    </div>

    <UpgradeModal />
  </div>
</template>
