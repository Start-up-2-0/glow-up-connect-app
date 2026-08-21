<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import type { NavItem } from '@/constants/navigation'
import SidebarNavGroup from './SidebarNavGroup.vue'
import SidebarNavItem from './SidebarNavItem.vue'

defineProps<{
  label: string
  items: NavItem[]
  collapsed?: boolean
}>()

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()

function isItemActive(to?: string) {
  if (!to) return false
  if (to === ROUTE_PATHS.DASHBOARD) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="sidebar-nav-section">
    <p v-if="!collapsed && label" class="sidebar-nav-section__label">
      {{ label }}
    </p>

    <div class="sidebar-nav-section__items">
      <template v-for="item in items" :key="item.id">
        <SidebarNavGroup
          v-if="item.children?.length"
          :id="item.id"
          :label="item.label"
          :icon="item.icon"
          :children="item.children"
          :collapsed="collapsed"
          @navigate="emit('navigate')"
        />
        <SidebarNavItem
          v-else
          :id="item.id"
          :label="item.label"
          :icon="item.icon"
          :to="item.to"
          :collapsed="collapsed"
          :selected="isItemActive(item.to)"
          @navigate="emit('navigate')"
        />
      </template>
    </div>
  </div>
</template>
