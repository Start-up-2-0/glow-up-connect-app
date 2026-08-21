<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { NavChildItem } from '@/constants/navigation'
import type { NavIconName } from '@/types/navIcon.types'
import { resolveNavIcon } from '@/utils/navIcon'
import { SIDEBAR_NAV_ITEM_ACTIVE_CLASS, SIDEBAR_NAV_ITEM_CLASS } from '@/constants/designTokens'
import SidebarNavIcon from './icons/SidebarNavIcon.vue'
import IconNavCaret from './icons/IconNavCaret.vue'

const props = defineProps<{
  id: string
  label: string
  icon?: NavIconName
  children: NavChildItem[]
  collapsed?: boolean
}>()

const iconName = computed(() => resolveNavIcon(props.id, props.icon))

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const expanded = ref(false)

function isChildRouteActive(to?: string) {
  if (!to) return false
  if (to === '/financeiro' || to === '/configuracoes/assinatura') return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

const hasActiveChild = computed(() =>
  props.children.some((child) => isChildRouteActive(child.to)),
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
  return isChildRouteActive(child.to)
}

function onNavigate() {
  emit('navigate')
}
</script>

<template>
  <div class="w-full">
    <button
      type="button"
      :class="[
        SIDEBAR_NAV_ITEM_CLASS,
        collapsed ? 'w-[60px] justify-center px-2' : '',
        expanded && !collapsed ? SIDEBAR_NAV_ITEM_ACTIVE_CLASS : '',
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
        :class="expanded ? 'font-medium' : 'font-normal'"
      >
        {{ label }}
      </span>
      <IconNavCaret
        v-if="!collapsed"
        :expanded="expanded"
        :size="16"
        class="shrink-0 text-glow-text"
      />
    </button>

    <div v-if="expanded && !collapsed" class="flex flex-col">
      <component
        :is="child.to ? RouterLink : 'button'"
        v-for="child in children"
        :key="child.id"
        :to="child.to"
        type="button"
        class="group flex h-11 items-center rounded-lg py-2 transition-colors hover:bg-glow-surface-tint"
        :class="isChildActive(child) ? 'gap-2.5 px-6' : 'px-5'"
        @click="onNavigate"
      >
        <span
          v-if="isChildActive(child)"
          class="size-1.5 shrink-0 rounded-full bg-glow-gold"
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
