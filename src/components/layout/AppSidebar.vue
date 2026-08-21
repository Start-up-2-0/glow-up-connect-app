<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardNav } from '@/composables/useDashboardNav'
import { useAppStore } from '@/stores/app.store'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNavSection from './SidebarNavSection.vue'
import SidebarFooter from './SidebarFooter.vue'

const props = withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  { mobile: false },
)

const appStore = useAppStore()
const { navSections } = useDashboardNav()

const collapsed = computed(() => !props.mobile && appStore.sidebarCollapsed)

const sidebarWidthClass = computed(() => {
  if (props.mobile) return 'w-[min(100vw,320px)]'
  return collapsed.value ? 'w-[99px]' : 'w-[288px]'
})

const innerPaddingClass = computed(() => {
  if (collapsed.value) return 'px-[7px] pt-6'
  if (props.mobile) return 'px-5 pt-5'
  return 'px-[23px] pt-[23px]'
})

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
    class="flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-glow-border-sidebar bg-glow-bg-surface shadow-glow-sm transition-[width] duration-300 ease-in-out"
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
        class="sidebar-nav-scroll flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto overscroll-y-contain"
        :class="collapsed ? 'pb-4' : 'pb-4'"
      >
        <SidebarNavSection
          v-for="section in navSections"
          :key="section.id"
          :label="section.label"
          :items="section.items"
          :collapsed="collapsed"
          @navigate="onNavigate"
        />
      </nav>
    </div>

    <div :class="collapsed ? 'px-[7px]' : 'px-[23px]'">
      <SidebarFooter :collapsed="collapsed" />
    </div>
  </aside>
</template>
