<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { useSidebarNav } from '@/components/sidebar/useSidebarNav'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import ShellPremiumBanner from '@/components/shell/ShellPremiumBanner.vue'
import ShellSidebarFooter from '@/components/shell/ShellSidebarFooter.vue'
import SidebarGroup from '@/components/sidebar/SidebarGroup.vue'
import SidebarWorkspace from '@/components/sidebar/SidebarWorkspace.vue'

const appStore = useAppStore()
const { temVinculoNegocio } = useAcessoUsuario()
const { navSections } = useSidebarNav()

const isOpen = computed(() => appStore.sidebarOpen)

function onNavigate() {
  appStore.closeSidebarOnMobile()
}
</script>

<template>
  <aside
    id="drawer-navigation"
    class="fixed left-0 top-0 z-[2010] flex h-screen w-64 flex-col border-r border-glow-border-sidebar bg-glow-surface pt-14 transition-transform duration-200 ease-out will-change-transform"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    aria-label="Sidenav"
  >
    <div class="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <div v-if="temVinculoNegocio" class="mb-3">
        <SidebarWorkspace />
      </div>

      <nav class="space-y-1" aria-label="Principal">
        <SidebarGroup
          v-for="section in navSections"
          :key="section.id"
          :section="section"
          @navigate="onNavigate"
        />
      </nav>
    </div>

    <div class="shrink-0 border-t border-glow-border-soft bg-glow-surface px-3 pb-3 pt-3">
      <ShellPremiumBanner />
      <ShellSidebarFooter />
    </div>
  </aside>
</template>
