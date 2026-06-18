<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { useDashboardNav } from '@/composables/useDashboardNav'
import { useAppStore } from '@/stores/app.store'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNavItem from './SidebarNavItem.vue'
import SidebarNavSection from './SidebarNavSection.vue'
import SidebarFooter from './SidebarFooter.vue'

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  { mobile: false },
)

const route = useRoute()
const appStore = useAppStore()
const { navSections, collapsedNavItems } = useDashboardNav()

const collapsed = computed(() => !props.mobile && appStore.sidebarCollapsed)

const sidebarWidthClass = computed(() => {
  if (props.mobile) return 'w-[min(100vw,320px)]'
  return collapsed.value ? 'w-[99px]' : 'w-[272px]'
})

const innerPaddingClass = computed(() => {
  if (collapsed.value) return 'px-[7px] pt-6'
  if (props.mobile) return 'px-5 pt-5'
  return 'px-[23px] pt-[23px]'
})

function isItemActive(to?: string) {
  if (!to) return false
  if (to === ROUTE_PATHS.DASHBOARD) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

function onNavigate() {
  appStore.closeSidebarOnMobile()
}

function onToggleCollapsed() {
  if (props.mobile) {
    appStore.setSidebarOpen(false)
    return
  }
  appStore.toggleSidebarCollapsed()
}
</script>

<template>
  <aside
    class="flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-glow-border-sidebar bg-glow-surface transition-[width] duration-300 ease-in-out"
    :class="sidebarWidthClass"
    aria-label="Menu principal"
  >
    <div
      class="flex min-h-0 flex-1 flex-col"
      :class="[innerPaddingClass, collapsed ? 'items-center' : '']"
    >
      <SidebarHeader
        :collapsed="collapsed"
        :mobile="mobile"
        class="mb-6"
        @toggle="onToggleCollapsed"
      />

      <nav
        class="sidebar-nav-scroll flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain"
        :class="collapsed ? 'gap-1.5 pb-4' : 'gap-3 pb-4'"
      >
        <template v-if="collapsed">
          <SidebarNavItem
            v-for="item in collapsedNavItems"
            :key="item.id"
            :id="item.id"
            :label="item.label"
            :icon="item.icon"
            :to="item.to"
            collapsed
            :selected="isItemActive(item.to)"
            @navigate="onNavigate"
          />
        </template>

        <template v-else>
          <SidebarNavSection
            v-for="section in navSections"
            :key="section.id"
            :section="section"
            @navigate="onNavigate"
          />
        </template>
      </nav>
    </div>

    <div :class="collapsed ? 'px-[7px]' : 'px-[23px]'">
      <SidebarFooter :collapsed="collapsed" />
    </div>
  </aside>
</template>
