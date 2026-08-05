<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '@/constants/navigation'
import { resolveSidebarIcon } from './sidebarIcons'
import SidebarTooltip from './SidebarTooltip.vue'
import type { SidebarBadge } from './useSidebarNav'

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
  const map: Record<string, string> = {
    default: 'bg-glow-neutral-bg text-glow-text-subtle',
    accent: 'bg-glow-gold-cta/15 text-glow-gold-cta',
    success: 'bg-glow-success-bg text-glow-success-dark',
  }
  return map[tone]
})
</script>

<template>
  <component
    :is="item.to ? 'router-link' : 'button'"
    :to="item.to || undefined"
    :type="item.to ? undefined : 'button'"
    class="group sb-item relative flex w-full items-center transition-all duration-200 ease-out"
    :class="[
      collapsed
        ? 'h-12 w-12 justify-center rounded-2xl'
        : 'h-[52px] gap-4 rounded-2xl px-4',
      active
        ? 'sb-item-active font-semibold text-glow-text'
        : isDisabled
          ? 'cursor-not-allowed text-glow-text-soft opacity-50'
          : 'text-glow-text-subtle hover:-translate-y-px hover:bg-glow-surface-tint hover:text-glow-text hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
    ]"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-label="collapsed ? item.label : undefined"
    @click="item.to && emit('navigate', item.to)"
  >
    <!-- Ícone em container arredondado (~34px) -->
    <span
      class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] transition-all duration-200"
      :class="
        active
          ? 'bg-glow-gold-cta/15 text-glow-gold-cta'
          : 'text-glow-text-subtle group-hover:bg-glow-surface-tint group-hover:text-glow-text'
      "
    >
      <component :is="iconComp" :size="18" :stroke-width="1.75" />
    </span>

    <!-- Texto -->
    <template v-if="!collapsed">
      <span class="min-w-0 flex-1 truncate text-left font-urbanist text-[13px] leading-none">
        {{ item.label }}
      </span>

      <!-- Badge (extrema direita) -->
      <span
        v-if="badge"
        class="ml-auto inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-urbanist text-[11px] font-semibold"
        :class="badgeClass"
      >
        {{ badge.value }}
      </span>
    </template>

    <SidebarTooltip v-if="collapsed" :label="item.label" />
  </component>
</template>

<style scoped>
.sb-item-active {
  background: linear-gradient(135deg, var(--glow-gold-selected, #efe9f8) 0%, transparent 86%);
  box-shadow:
    inset 3px 0 0 var(--glow-gold-cta),
    0 2px 12px -2px rgba(146, 103, 155, 0.18);
  font-weight: 600;
}
.sb-item:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>