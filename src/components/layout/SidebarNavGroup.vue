<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { NavChildItem } from '@/constants/navigation'
import type { NavIconName } from '@/types/navIcon.types'
import { resolveNavIcon } from '@/utils/navIcon'
import SidebarNavIcon from './icons/SidebarNavIcon.vue'
import IconNavCaret from './icons/IconNavCaret.vue'

const props = defineProps<{
  id: string
  label: string
  icon?: NavIconName
  children: NavChildItem[]
  collapsed?: boolean
  nested?: boolean
}>()

const iconName = computed(() => resolveNavIcon(props.id, props.icon))

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const expanded = ref(false)

function matchesPath(to: string, path: string) {
  if (to === '/dashboard') return path === to
  return path === to || path.startsWith(`${to}/`)
}

const hasActiveChild = computed(() =>
  props.children.some((child) => child.to && matchesPath(child.to, route.path)),
)

watch(
  () => route.path,
  () => {
    if (hasActiveChild.value) expanded.value = true
  },
  { immediate: true },
)

function toggleExpanded() {
  if (props.collapsed) return
  expanded.value = !expanded.value
}

function isChildActive(child: NavChildItem) {
  return child.to ? matchesPath(child.to, route.path) : false
}

function onNavigate() {
  emit('navigate')
}
</script>

<template>
  <div class="w-full">
    <button
      type="button"
      class="group flex h-11 w-full items-center gap-3 rounded-lg py-2 transition-colors"
      :class="[
        collapsed ? 'w-[60px] justify-center px-2' : nested ? 'pl-3 pr-2' : 'pl-2 pr-2',
        expanded && !collapsed
          ? 'bg-glow-gold-selected'
          : hasActiveChild && !collapsed
            ? 'bg-black/[0.02]'
            : 'hover:bg-black/[0.03]',
        nested && !collapsed ? 'sidebar-nav-group--nested' : '',
      ]"
      :aria-expanded="collapsed ? undefined : expanded"
      @click="toggleExpanded"
    >
      <SidebarNavIcon
        :name="iconName"
        :size="22"
        class="shrink-0 text-glow-text"
      />
      <span
        v-if="!collapsed"
        class="flex-1 truncate text-left font-urbanist text-sm leading-none text-glow-text transition-colors group-hover:text-glow-text-hover"
        :class="expanded || hasActiveChild ? 'font-medium' : 'font-normal'"
      >
        {{ label }}
      </span>
      <IconNavCaret
        v-if="!collapsed"
        :expanded="expanded"
        :size="16"
        class="shrink-0 text-glow-text-subtle"
      />
    </button>

    <div
      v-if="expanded && !collapsed"
      class="flex flex-col border-l border-glow-border-soft"
      :class="nested ? 'ml-5' : 'ml-3'"
    >
      <component
        :is="child.to ? RouterLink : 'button'"
        v-for="child in children"
        :key="child.id"
        :to="child.to"
        type="button"
        class="group flex h-11 items-center rounded-lg py-2 pl-4 pr-3 transition-colors hover:bg-black/[0.03]"
        :class="isChildActive(child) ? 'bg-glow-gold-selected/60' : ''"
        :aria-current="isChildActive(child) ? 'page' : undefined"
        @click="onNavigate"
      >
        <span
          v-if="isChildActive(child)"
          class="mr-2.5 size-1.5 shrink-0 rounded-full bg-glow-gold"
          aria-hidden="true"
        />
        <span
          class="truncate font-urbanist text-sm leading-none text-glow-text transition-colors group-hover:text-glow-text-hover"
          :class="isChildActive(child) ? 'font-medium' : 'font-normal'"
        >
          {{ child.label }}
        </span>
      </component>
    </div>
  </div>
</template>
