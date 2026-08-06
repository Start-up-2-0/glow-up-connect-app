<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app.store'
import AppShellSidebar from '@/components/shell/AppShellSidebar.vue'
import AppShellTopbar from '@/components/shell/AppShellTopbar.vue'
import UpgradeModal from '@/components/access/UpgradeModal.vue'

const appStore = useAppStore()

const BODY_DRAWER_CLASS = 'guc-mobile-drawer-open'

function syncDrawerBodyClass(open: boolean) {
  if (typeof document === 'undefined') return
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  document.body.classList.toggle(BODY_DRAWER_CLASS, open && isMobile)
}

watch(
  () => appStore.sidebarOpen,
  (open) => syncDrawerBodyClass(open),
  { immediate: true },
)

onUnmounted(() => {
  document.body.classList.remove(BODY_DRAWER_CLASS)
})
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
        class="fixed inset-0 z-[2000] bg-[rgba(13,8,37,0.55)] backdrop-blur-[1px] md:hidden"
        aria-hidden="true"
        @click="appStore.setSidebarOpen(false)"
      />
    </Transition>

    <AppShellSidebar />

    <main
      class="min-h-dvh overflow-x-hidden p-4 pt-16 md:ml-64"
      :class="{ 'guc-main--drawer-open': appStore.sidebarOpen }"
    >
      <div class="w-full">
        <slot />
      </div>
    </main>

    <UpgradeModal />
  </div>
</template>
