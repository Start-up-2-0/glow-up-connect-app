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

/** Badge config-driven: usa `item.badge` se presente, senão fallback por id. */
function resolveBadge(item: { id: string; badge?: string }): SidebarBadge | null {
  if (item.badge) return { value: item.badge, tone: 'default' }
  return badgeFor(item.id)
}
</script>

<template>
  <div class="mt-8 first:mt-0">
    <p
      v-if="!collapsed"
      class="mb-4 px-3 font-urbanist text-[11px] font-semibold uppercase tracking-[0.12em] text-glow-text-soft"
    >
      {{ title }}
    </p>

    <div class="flex flex-col gap-1.5" :class="collapsed ? 'items-center' : ''">
      <SidebarSubmenu
        v-for="item in section.items.filter(hasChildren)"
        :key="item.id"
        :item="item"
        :collapsed="collapsed"
        @navigate="emit('navigate', $event)"
      />
      <SidebarItem
        v-for="item in section.items.filter(isLeaf)"
        :key="item.id"
        :item="item"
        :collapsed="collapsed"
        :active="isRouteActive(item.to)"
        :badge="resolveBadge(item)"
        @navigate="emit('navigate', $event)"
      />
    </div>
  </div>
</template>