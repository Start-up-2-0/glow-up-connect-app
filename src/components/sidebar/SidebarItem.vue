<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '@/constants/navigation'
import { resolveSidebarIcon } from '@/components/sidebar/sidebarIcons'
import type { SidebarBadge } from '@/components/sidebar/useSidebarNav'

const props = defineProps<{
  item: NavItem
  collapsed?: boolean
  active?: boolean
  badge?: SidebarBadge | null
}>()

const emit = defineEmits<{ navigate: [to?: string] }>()

const iconComp = computed(() => resolveSidebarIcon(props.item.id, props.item.icon))
const isDisabled = computed(() => !props.item.to)

const badgeClass = computed(() => {
  const tone = props.badge?.tone ?? 'default'
  if (tone === 'success') {
    return 'bg-glow-success-bg text-glow-success'
  }
  if (tone === 'accent' || tone === 'premium') {
    return 'bg-glow-gold-selected text-glow-gold-cta'
  }
  return 'bg-glow-surface-tint text-glow-text-subtle'
})
</script>

<template>
  <component
    :is="item.to ? 'router-link' : 'button'"
    :to="item.to || undefined"
    :type="item.to ? undefined : 'button'"
    class="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-normal leading-snug text-glow-text-subtle transition-colors duration-150 hover:bg-glow-hover-surface hover:text-glow-text"
    :class="[
      active
        ? 'bg-glow-gold-selected font-medium text-glow-text'
        : '',
      isDisabled ? 'cursor-not-allowed opacity-45' : '',
    ]"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="isDisabled || undefined"
    @click="item.to && emit('navigate', item.to)"
  >
    <component
      :is="iconComp"
      class="size-4 shrink-0 transition-colors"
      :class="
        active
          ? 'text-glow-gold-cta'
          : 'text-glow-text-muted group-hover:text-glow-text-subtle'
      "
      :stroke-width="1.75"
    />
    <span class="min-w-0 flex-1 truncate text-left tracking-tight">{{ item.label }}</span>
    <span
      v-if="badge"
      class="inline-flex h-4 shrink-0 items-center rounded-full px-1.5 text-[10px] font-medium tracking-wide"
      :class="badgeClass"
    >
      {{ badge.value }}
    </span>
  </component>
</template>
