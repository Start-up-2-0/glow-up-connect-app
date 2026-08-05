<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Moon, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app.store'

defineProps<{ collapsed?: boolean }>()

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
</script>

<template>
  <!-- Recolhida: ícone isolado -->
  <button
    v-if="collapsed"
    type="button"
    class="group relative flex size-11 items-center justify-center rounded-xl text-glow-text-subtle transition-all duration-200 hover:bg-glow-surface-tint hover:text-glow-text"
    :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
    @click="appStore.toggleTheme()"
  >
    <Sun v-if="isDark" :size="19" :stroke-width="1.75" />
    <Moon v-else :size="19" :stroke-width="1.75" />
  </button>

  <!-- Expandida: card premium -->
  <button
    v-else
    type="button"
    class="sb-theme-card group flex w-full items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface p-3 text-left transition-all duration-200 hover:border-glow-gold-cta/40 hover:shadow-glow-sm"
    @click="appStore.toggleTheme()"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/10 text-glow-gold-cta transition-transform duration-200 group-hover:scale-105"
    >
      <Sun v-if="isDark" :size="18" :stroke-width="1.75" />
      <Moon v-else :size="18" :stroke-width="1.75" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block font-urbanist text-sm font-semibold text-glow-text">
        {{ isDark ? 'Modo claro' : 'Modo escuro' }}
      </span>
      <span class="block font-urbanist text-xs text-glow-text-subtle">
        {{ isDark ? 'Mude para o tema claro' : 'Mude para o tema escuro' }}
      </span>
    </span>
    <span
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200"
      :class="isDark ? 'bg-glow-gold-cta' : 'bg-glow-neutral-bg'"
      role="switch"
      :aria-checked="isDark"
      aria-label="Alternar tema"
    >
      <span
        class="block size-5 rounded-full bg-white shadow transition-transform duration-200"
        :class="isDark ? 'translate-x-5' : 'translate-x-0'"
      />
    </span>
  </button>
</template>

<style scoped>
.sb-theme-card:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>