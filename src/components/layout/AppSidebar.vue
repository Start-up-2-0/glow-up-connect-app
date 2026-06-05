<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { dashboardNavItems } from '@/constants/navigation'
import { useAppStore } from '@/stores/app.store'
import AppLogo from './AppLogo.vue'
import SidebarToggleButton from './SidebarToggleButton.vue'
import SidebarNavItem from './SidebarNavItem.vue'
import SidebarNavGroup from './SidebarNavGroup.vue'

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  { mobile: false },
)

const route = useRoute()
const appStore = useAppStore()

const collapsed = computed(() => !props.mobile && appStore.sidebarCollapsed)

const sidebarWidthClass = computed(() => {
  if (props.mobile) return 'w-[272px]'
  return collapsed.value ? 'w-[99px]' : 'w-[272px]'
})

const innerPaddingClass = computed(() =>
  collapsed.value ? 'px-[7px] pt-6' : 'px-[23px] pt-[23px]',
)

function isItemActive(to?: string) {
  return to ? route.path === to : false
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
    class="flex h-full shrink-0 flex-col border-r border-glow-border-sidebar bg-glow-surface transition-[width] duration-300 ease-in-out"
    :class="sidebarWidthClass"
  >
    <div
      class="flex h-full flex-col"
      :class="[innerPaddingClass, collapsed ? 'items-center gap-10' : 'gap-10']"
    >
      <div
        class="flex w-full shrink-0 items-center gap-2"
        :class="collapsed ? 'justify-center' : 'justify-between'"
      >
        <AppLogo v-if="!collapsed" class="min-w-0 flex-1" />
        <SidebarToggleButton :collapsed="collapsed" @toggle="onToggleCollapsed" />
      </div>

      <nav class="flex w-full flex-col gap-1.5 overflow-y-auto pb-6">
        <template v-for="item in dashboardNavItems" :key="item.id">
          <SidebarNavGroup
            v-if="item.children?.length"
            :label="item.label"
            :children="item.children"
            :collapsed="collapsed"
            @navigate="onNavigate"
          />
          <SidebarNavItem
            v-else
            :label="item.label"
            :to="item.to"
            :collapsed="collapsed"
            :selected="isItemActive(item.to)"
            @navigate="onNavigate"
          />
        </template>
      </nav>
    </div>
  </aside>
</template>
