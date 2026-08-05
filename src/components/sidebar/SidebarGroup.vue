<script setup lang="ts">
import { computed } from 'vue'
import type { NavSection } from '@/constants/navigation'
import SidebarItem from './SidebarItem.vue'
import SidebarSubmenu from './SidebarSubmenu.vue'
import { useSidebarNav, type SidebarBadge } from './useSidebarNav'

const props = defineProps<{
  section: NavSection
  collapsed?: boolean
}>()

const emit = defineEmits<{ navigate: [to?: string] }>()
const { isRouteActive, badgeFor, sectionLabel } = useSidebarNav()

const title = computed(() => sectionLabel(props.section.id, props.section.label))

const hasChildren = (item: { children?: unknown[] }) => !!item.children && item.children.length > 0
const isLeaf = (item: { children?: unknown[] }) => !item.children || item.children.length === 0

function resolveBadge(item: { id: string; badge?: string }): SidebarBadge | null {
  if (item.badge) {
    const tone =
      item.badge.toLowerCase() === 'beta'
        ? 'accent'
        : item.badge.toLowerCase() === 'novo'
          ? 'success'
          : 'default'
    return { value: item.badge, tone }
  }
  return badgeFor(item.id)
}
</script>

<template>
  <div class="mb-3 last:mb-0">
    <p
      class="mb-1 px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-glow-text-muted"
    >
      {{ title }}
    </p>
    <ul class="space-y-0.5">
      <li v-for="item in section.items.filter(hasChildren)" :key="item.id">
        <SidebarSubmenu :item="item" @navigate="emit('navigate', $event)" />
      </li>
      <li v-for="item in section.items.filter(isLeaf)" :key="item.id">
        <SidebarItem
          :item="item"
          :active="isRouteActive(item.to)"
          :badge="resolveBadge(item)"
          @navigate="emit('navigate', $event)"
        />
      </li>
    </ul>
  </div>
</template>
