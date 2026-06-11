<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { useDashboardNav } from '@/composables/useDashboardNav'
import { useAppStore } from '@/stores/app.store'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNavItem from './SidebarNavItem.vue'
import SidebarNavGroup from './SidebarNavGroup.vue'
import SidebarFooter from './SidebarFooter.vue'

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  { mobile: false },
)

const route = useRoute()
const appStore = useAppStore()
const { navItems } = useDashboardNav()

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
        class="sidebar-nav-scroll flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-y-auto overscroll-y-contain"
        :class="collapsed ? 'pb-4' : 'pb-4'"
      >
        <template v-for="item in navItems" :key="item.id">
          <SidebarNavGroup
            v-if="item.children?.length"
            :id="item.id"
            :label="item.label"
            :icon="item.icon"
            :children="item.children"
            :collapsed="collapsed"
            @navigate="onNavigate"
          />
          <SidebarNavItem
            v-else
            :id="item.id"
            :label="item.label"
            :icon="item.icon"
            :to="item.to"
            :collapsed="collapsed"
            :selected="isItemActive(item.to)"
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
