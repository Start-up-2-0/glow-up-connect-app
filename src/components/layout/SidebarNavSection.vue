<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { NavSection } from '@/constants/navigation'
import { navSectionHasActiveItem } from '@/utils/filterNavItems'
import SidebarNavItem from './SidebarNavItem.vue'
import SidebarNavGroup from './SidebarNavGroup.vue'
import IconNavCaret from './icons/IconNavCaret.vue'

const props = defineProps<{
  section: NavSection
  collapsed?: boolean
}>()

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const expanded = ref(false)

const hasActiveItem = computed(() => navSectionHasActiveItem(props.section, route.path))

const isSingleDirectLink = computed(() => {
  if (props.section.items.length !== 1) return false
  const item = props.section.items[0]
  return Boolean(item.to && !item.children?.length)
})

watch(
  () => route.path,
  () => {
    if (hasActiveItem.value) expanded.value = true
  },
  { immediate: true },
)

function toggleExpanded() {
  if (props.collapsed || isSingleDirectLink.value) return
  expanded.value = !expanded.value
}

function isItemActive(to?: string) {
  if (!to) return false
  if (to === '/dashboard') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

function onNavigate() {
  emit('navigate')
}
</script>

<template>
  <section class="sidebar-nav-section" :aria-label="section.label">
    <template v-if="isSingleDirectLink && section.items[0]">
      <p v-if="!collapsed" class="sidebar-nav-section__label">{{ section.label }}</p>
      <SidebarNavItem
        :id="section.items[0].id"
        :label="section.items[0].label"
        :icon="section.items[0].icon"
        :to="section.items[0].to"
        :collapsed="collapsed"
        :selected="isItemActive(section.items[0].to)"
        @navigate="onNavigate"
      />
    </template>

    <template v-else>
      <button
        v-if="!collapsed"
        type="button"
        class="sidebar-nav-section__trigger"
        :class="{ 'sidebar-nav-section__trigger--active': hasActiveItem }"
        :aria-expanded="expanded"
        @click="toggleExpanded"
      >
        <span class="sidebar-nav-section__trigger-label">{{ section.label }}</span>
        <IconNavCaret :expanded="expanded" :size="16" class="shrink-0 text-glow-text-subtle" />
      </button>

      <div
        v-show="expanded || collapsed"
        class="sidebar-nav-section__items"
        :class="collapsed ? 'gap-1.5' : 'sidebar-nav-section__items--expanded'"
      >
        <template v-for="item in section.items" :key="item.id">
          <SidebarNavGroup
            v-if="item.children?.length"
            :id="item.id"
            :label="item.label"
            :icon="item.icon"
            :children="item.children"
            :collapsed="collapsed"
            nested
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
      </div>
    </template>
  </section>
</template>
