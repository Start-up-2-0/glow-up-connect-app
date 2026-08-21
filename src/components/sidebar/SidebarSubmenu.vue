<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import type { NavItem } from '@/constants/navigation'
import { useAppStore } from '@/stores/app.store'
import { resolveSidebarIcon } from './sidebarIcons'
import { useSidebarNav } from './useSidebarNav'

const props = defineProps<{
  item: NavItem
  collapsed?: boolean
}>()

const emit = defineEmits<{ navigate: [to?: string] }>()

const route = useRoute()
const appStore = useAppStore()
const { hasActiveChild, isRouteActive, badgeFor } = useSidebarNav()

const isOpen = computed(() => appStore.openSubmenuKeys.has(props.item.id))
const groupActive = computed(() => hasActiveChild(props.item))
const badge = computed(() =>
  props.item.badge
    ? { value: props.item.badge, tone: 'default' as const }
    : badgeFor(props.item.id),
)
const iconComp = computed(() => resolveSidebarIcon(props.item.id, props.item.icon))

watch(
  () => route.path,
  () => {
    if (hasActiveChild(props.item)) {
      appStore.setSubmenuOpen(props.item.id, true)
    }
  },
  { immediate: true },
)

function toggle() {
  appStore.toggleSubmenu(props.item.id)
}
</script>

<template>
  <div>
    <button
      type="button"
      class="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-normal leading-snug text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text"
      :class="groupActive ? 'bg-glow-gold-selected font-medium text-glow-text' : ''"
      :aria-expanded="isOpen"
      :aria-controls="`dropdown-${item.id}`"
      @click="toggle"
    >
      <component
        :is="iconComp"
        class="size-4 shrink-0 transition-colors"
        :class="
          groupActive
            ? 'text-glow-gold-cta'
            : 'text-glow-text-muted group-hover:text-glow-text-subtle'
        "
        :stroke-width="1.75"
      />
      <span class="min-w-0 flex-1 truncate text-left tracking-tight">{{ item.label }}</span>
      <span
        v-if="badge"
        class="inline-flex h-4 items-center rounded-full bg-glow-gold-selected px-1.5 text-[10px] font-medium text-glow-gold-cta"
      >
        {{ badge.value }}
      </span>
      <ChevronDown
        class="size-3.5 shrink-0 text-glow-text-muted transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
        :stroke-width="1.75"
      />
    </button>

    <ul v-show="isOpen" :id="`dropdown-${item.id}`" class="mt-0.5 space-y-0.5 py-0.5">
      <li v-for="child in item.children" :key="child.id">
        <component
          :is="child.to ? 'router-link' : 'button'"
          :to="child.to || undefined"
          :type="child.to ? undefined : 'button'"
          class="flex w-full items-center rounded-md py-1.5 pl-8 pr-2 text-[13px] font-normal text-glow-text-muted transition-colors hover:bg-glow-hover-surface hover:text-glow-text"
          :class="
            isRouteActive(child.to)
              ? 'bg-glow-gold-selected font-medium text-glow-text'
              : ''
          "
          @click="child.to && emit('navigate', child.to)"
        >
          {{ child.label }}
        </component>
      </li>
    </ul>
  </div>
</template>
