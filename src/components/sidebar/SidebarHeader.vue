<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import AppLogo from '@/components/layout/AppLogo.vue'
import { APP_NAME } from '@/constants/storageKeys'

defineProps<{
  collapsed?: boolean
  mobile?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div
    class="flex items-center"
    :class="collapsed ? 'flex-col gap-4' : 'justify-between gap-3'"
  >
    <div
      v-if="collapsed"
      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-glow-gold-cta/10 text-glow-gold-cta"
    >
      <AppLogo compact logo-class="size-6 rounded-md object-contain" />
    </div>

    <div v-else class="flex min-w-0 items-center gap-2.5">
      <AppLogo compact logo-class="size-8 shrink-0 rounded-lg object-contain" />
      <div class="min-w-0">
        <p class="truncate font-urbanist text-base font-bold leading-tight text-glow-text">
          {{ APP_NAME }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="sb-header-toggle flex size-8 shrink-0 items-center justify-center rounded-lg text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text"
      :aria-label="mobile ? 'Fechar sidebar' : collapsed ? 'Expandir sidebar' : 'Recolher sidebar'"
      @click="emit('toggle')"
    >
      <PanelLeftOpen v-if="collapsed && !mobile" :size="18" :stroke-width="1.75" />
      <PanelLeftClose v-else :size="18" :stroke-width="1.75" />
    </button>
  </div>
</template>

<style scoped>
.sb-header-toggle:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>