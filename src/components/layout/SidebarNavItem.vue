<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { NavIconName } from '@/types/navIcon.types'
import { resolveNavIcon } from '@/utils/navIcon'
import { SIDEBAR_NAV_ITEM_ACTIVE_CLASS, SIDEBAR_NAV_ITEM_CLASS } from '@/constants/designTokens'
import SidebarNavIcon from './icons/SidebarNavIcon.vue'

const props = defineProps<{
  id: string
  label: string
  to?: string
  icon?: NavIconName
  collapsed?: boolean
  selected?: boolean
}>()

const iconName = computed(() => resolveNavIcon(props.id, props.icon))

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()

const isActive = computed(() => {
  if (props.selected !== undefined) return props.selected
  return props.to ? route.path === props.to : false
})

function onClick() {
  emit('navigate')
}
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    type="button"
    :class="[
      SIDEBAR_NAV_ITEM_CLASS,
      collapsed ? 'w-[60px] justify-center px-2' : '',
      isActive ? SIDEBAR_NAV_ITEM_ACTIVE_CLASS : '',
      !to && !collapsed ? 'cursor-default' : '',
    ]"
    :aria-current="isActive ? 'page' : undefined"
    :aria-disabled="!to ? true : undefined"
    @click="onClick"
  >
    <SidebarNavIcon
      :name="iconName"
      :size="22"
      class="shrink-0 text-glow-text transition-colors group-hover:text-glow-text-hover"
      :class="isActive ? 'text-glow-gold-cta' : ''"
    />
    <span
      v-if="!collapsed"
      class="truncate font-urbanist text-sm leading-none text-glow-text transition-colors group-hover:text-glow-text-hover"
      :class="isActive ? 'font-medium text-glow-text' : 'font-normal'"
    >
      {{ label }}
    </span>
  </component>
</template>
