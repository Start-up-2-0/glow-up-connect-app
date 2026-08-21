<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app.store'
import { useSidebarNav } from './useSidebarNav'
import SidebarHeader from './SidebarHeader.vue'
import SidebarWorkspace from './SidebarWorkspace.vue'
import SidebarGroup from './SidebarGroup.vue'
import SidebarThemeCard from './SidebarThemeCard.vue'
import SidebarPremiumBanner from './SidebarPremiumBanner.vue'
import SidebarFooter from './SidebarFooter.vue'

const props = withDefaults(defineProps<{ mobile?: boolean }>(), { mobile: false })

const appStore = useAppStore()
const { navSections } = useSidebarNav()

const collapsed = computed(() => !props.mobile && appStore.sidebarCollapsed)

const visibleSections = computed(() => navSections.value)

function onNavigate() {
  appStore.closeSidebarOnMobile()
}

function onToggle() {
  if (props.mobile) {
    appStore.setSidebarOpen(false)
  } else {
    appStore.toggleSidebarCollapsed()
  }
}
</script>

<template>
  <aside
    class="relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-glow-border-sidebar bg-glow-bg-surface transition-[width] duration-200 ease-out"
    :class="mobile ? 'w-[min(100vw,320px)]' : collapsed ? 'w-[88px]' : 'w-72'"
    :aria-label="mobile ? 'Menu lateral (mobile)' : 'Menu lateral'"
    role="navigation"
  >
    <div class="flex min-h-0 flex-1 flex-col" :class="collapsed ? 'px-3 pt-5' : 'px-4 pt-5'">
      <SidebarHeader :collapsed="collapsed" :mobile="mobile" @toggle="onToggle" />

      <!-- Workspace / empresa -->
      <div v-if="!collapsed" class="mt-5">
        <SidebarWorkspace />
      </div>

      <!-- Navegação -->
      <nav class="sidebar-scroll mt-5 min-h-0 flex-1 overflow-y-auto pb-4" aria-label="Principal">
        <SidebarGroup
          v-for="section in visibleSections"
          :key="section.id"
          :section="section"
          :collapsed="collapsed"
          @navigate="onNavigate"
        />
      </nav>

      <!-- Rodapé -->
      <div class="flex flex-col gap-3 pb-5 pt-4" :class="collapsed ? 'items-center' : ''">
        <SidebarThemeCard :collapsed="collapsed" />
        <SidebarPremiumBanner v-if="!collapsed" />
        <SidebarWorkspace v-if="collapsed" :collapsed="true" />
        <SidebarFooter :collapsed="collapsed" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-scroll {
  scrollbar-width: none;
}
.sidebar-scroll::-webkit-scrollbar {
  display: none;
}
.sidebar-scroll {
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 14px, #000 calc(100% - 14px), transparent);
}
</style>