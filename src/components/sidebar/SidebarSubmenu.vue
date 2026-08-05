<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import type { NavItem } from '@/constants/navigation'
import { useAppStore } from '@/stores/app.store'
import { resolveSidebarIcon } from './sidebarIcons'
import SidebarTooltip from './SidebarTooltip.vue'
import { useSidebarNav } from './useSidebarNav'

const props = defineProps<{
  item: NavItem
  collapsed?: boolean
}>()

const emit = defineEmits<{ navigate: [to?: string] }>()

const route = useRoute()
const appStore = useAppStore()
const { hasActiveChild, isRouteActive, badgeFor } = useSidebarNav()

// Lê o estado direto do store (reativo) — sem snapshot desembrulhado.
const isOpen = computed(() => appStore.openSubmenuKeys.has(props.item.id))
const groupActive = computed(() => hasActiveChild(props.item))
const badge = computed(() =>
  props.item.badge
    ? { value: props.item.badge, tone: 'default' as const }
    : badgeFor(props.item.id),
)
const iconComp = computed(() => resolveSidebarIcon(props.item.id, props.item.icon))

// Abre automaticamente quando um filho fica ativo.
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
  <div class="sb-submenu">
    <!-- Cabeçalho do grupo -->
    <button
      type="button"
      class="group relative flex w-full items-center transition-all duration-200 ease-out"
      :class="[
        collapsed ? 'h-12 w-12 justify-center rounded-2xl' : 'h-[52px] gap-4 rounded-2xl px-4',
        groupActive
          ? 'sb-item-active text-glow-text'
          : 'text-glow-text-subtle hover:-translate-y-px hover:bg-glow-surface-tint hover:text-glow-text hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
      ]"
      :aria-expanded="isOpen"
      :aria-controls="`submenu-${item.id}`"
      :aria-label="collapsed ? item.label : undefined"
      @click="toggle"
    >
      <span
        class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] transition-all duration-200"
        :class="
          groupActive
            ? 'bg-glow-gold-cta/15 text-glow-gold-cta'
            : 'text-glow-text-subtle group-hover:bg-glow-surface-tint group-hover:text-glow-text'
        "
      >
        <component :is="iconComp" :size="18" :stroke-width="1.75" />
      </span>

      <template v-if="!collapsed">
        <span class="min-w-0 flex-1 truncate text-left font-urbanist text-[13px] leading-none">
          {{ item.label }}
        </span>
        <span
          v-if="badge"
          class="ml-auto inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-urbanist text-[11px] font-semibold"
          :class="badge.tone === 'success' ? 'bg-glow-success-bg text-glow-success-dark' : 'bg-glow-gold-cta/15 text-glow-gold-cta'"
        >
          {{ badge.value }}
        </span>
        <ChevronDown
          :size="16"
          class="shrink-0 text-glow-text-subtle transition-transform duration-200 ease-out"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </template>

      <SidebarTooltip v-if="collapsed" :label="item.label" />
    </button>

    <!-- Filhos -->
    <Transition
      v-if="!collapsed"
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-show="isOpen" :id="`submenu-${item.id}`" class="overflow-hidden">
        <div class="relative mb-2 mt-2 pl-[52px]">
          <!-- Linha guia discreta -->
          <span
            class="absolute left-[17px] top-1 bottom-1 w-px bg-glow-border-soft"
            aria-hidden="true"
          />
          <div class="flex flex-col gap-1">
            <component
              :is="child.to ? 'router-link' : 'button'"
              v-for="child in item.children"
              :key="child.id"
              :to="child.to || undefined"
              :type="child.to ? undefined : 'button'"
              class="relative flex h-10 items-center gap-2.5 rounded-xl pl-4 pr-3 font-urbanist text-[13px] transition-all duration-200"
              :class="
                isRouteActive(child.to)
                  ? 'font-semibold text-glow-text'
                  : 'text-glow-text-subtle hover:bg-glow-surface-tint hover:text-glow-text'
              "
              :aria-current="isRouteActive(child.to) ? 'page' : undefined"
              @click="child.to && emit('navigate', child.to)"
            >
              <span
                class="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full transition-all duration-200"
                :class="isRouteActive(child.to) ? 'bg-glow-gold-cta' : 'bg-transparent'"
                aria-hidden="true"
              />
              {{ child.label }}
            </component>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sb-item-active {
  background: linear-gradient(135deg, var(--glow-gold-selected, #efe9f8) 0%, transparent 86%);
  box-shadow:
    inset 3px 0 0 var(--glow-gold-cta),
    0 2px 12px -2px rgba(146, 103, 155, 0.18);
  font-weight: 600;
}
.sb-submenu button:focus-visible,
.sb-submenu a:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>