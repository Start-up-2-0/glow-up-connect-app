<script setup lang="ts">
import { ref } from 'vue'
import { NAV_SEARCH_PLACEHOLDER } from '@/constants/navigation'
import AppNotifications from './AppNotifications.vue'
import AppUserMenu from './AppUserMenu.vue'
import NavbarIconButton from './NavbarIconButton.vue'
import IconSearch from './icons/IconSearch.vue'
import IconSettings from './icons/IconSettings.vue'

defineEmits<{
  toggleSidebar: []
}>()

const searchQuery = ref('')
</script>

<template>
  <header class="shrink-0 bg-glow-canvas px-4 pt-4 lg:px-6 lg:pt-6">
    <div class="flex items-center gap-2 pb-3 lg:gap-4 lg:pb-[17px]">
      <button
        type="button"
        class="flex size-10 shrink-0 items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text lg:hidden"
        aria-label="Abrir menu"
        @click="$emit('toggleSidebar')"
      >
        <span class="sr-only">Menu</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 6H16M4 10H16M4 14H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <div class="relative hidden min-w-0 flex-1 lg:block">
        <label for="dashboard-search" class="sr-only">Pesquisar</label>
        <div
          class="relative flex h-[46px] max-w-[480px] items-center rounded-xl border border-glow-border-soft bg-glow-surface"
        >
          <IconSearch class="pointer-events-none absolute left-3.5 text-glow-text" :size="20" />
          <input
            id="dashboard-search"
            v-model="searchQuery"
            type="search"
            :placeholder="NAV_SEARCH_PLACEHOLDER"
            class="h-full w-full rounded-xl border-0 bg-transparent pl-11 pr-4 font-urbanist text-sm text-glow-text placeholder:text-[rgba(40,40,40,0.3)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div class="ml-auto flex shrink-0 items-center gap-1.5 lg:gap-2">
        <AppNotifications />
        <NavbarIconButton label="Configurações">
          <IconSettings :size="20" />
        </NavbarIconButton>
        <AppUserMenu compact class="lg:hidden" />
        <AppUserMenu class="hidden lg:block" />
      </div>
    </div>

    <div class="pb-3 lg:hidden">
      <label for="dashboard-search-mobile" class="sr-only">Pesquisar</label>
      <div
        class="relative flex h-10 w-full items-center rounded-xl border border-glow-border-soft bg-glow-surface"
      >
        <IconSearch class="pointer-events-none absolute left-3 text-glow-text" :size="18" />
        <input
          id="dashboard-search-mobile"
          v-model="searchQuery"
          type="search"
          :placeholder="NAV_SEARCH_PLACEHOLDER"
          class="h-full w-full rounded-xl border-0 bg-transparent pl-10 pr-3 font-urbanist text-sm text-glow-text placeholder:text-[rgba(40,40,40,0.3)] focus:outline-none focus:ring-0"
        />
      </div>
    </div>

    <div class="h-px w-full bg-glow-border-soft" />
  </header>
</template>
