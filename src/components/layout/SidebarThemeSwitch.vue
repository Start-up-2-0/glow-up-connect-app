<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)

const switchId = 'sidebar-theme-switch'
</script>

<template>
  <div
    class="flex w-full items-center justify-between gap-3 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-2.5"
  >
    <label
      :for="switchId"
      class="cursor-pointer font-urbanist text-sm text-glow-text"
    >
      Modo escuro
    </label>

    <label class="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        :id="switchId"
        type="checkbox"
        class="peer sr-only"
        :checked="isDark"
        @change="appStore.toggleTheme()"
      />
      <div
        class="relative h-6 w-11 rounded-full border border-glow-border-soft bg-glow-surface after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-glow-border-soft after:bg-glow-canvas after:transition-all after:content-[''] peer-checked:border-glow-gold/40 peer-checked:bg-glow-gold peer-checked:after:translate-x-full peer-checked:after:border-glow-gold/30 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-glow-gold/50"
        aria-hidden="true"
      />
      <span class="sr-only">{{ isDark ? 'Desativar modo escuro' : 'Ativar modo escuro' }}</span>
    </label>
  </div>
</template>
