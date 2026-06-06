<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardNav } from '@/composables/useDashboardNav'
import AppNotifications from './AppNotifications.vue'
import AppUserMenu from './AppUserMenu.vue'
import NavbarIconButton from './NavbarIconButton.vue'
import NavbarSearchModal from './NavbarSearchModal.vue'
import NavbarThemeToggle from './NavbarThemeToggle.vue'
import IconSearch from './icons/IconSearch.vue'

defineEmits<{
  toggleSidebar: []
}>()

const searchQuery = ref('')
const searchOpen = ref(false)
const { searchPlaceholder } = useDashboardNav()
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
            :placeholder="searchPlaceholder"
            class="h-full w-full rounded-xl border-0 bg-transparent pl-11 pr-4 font-urbanist text-sm text-glow-text placeholder:text-glow-placeholder focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div class="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-0 lg:gap-2">
        <NavbarIconButton label="Pesquisar" class="lg:hidden" @click="searchOpen = true">
          <IconSearch :size="20" />
        </NavbarIconButton>
        <AppNotifications />
        <NavbarThemeToggle />
        <AppUserMenu compact class="lg:hidden" />
        <AppUserMenu class="hidden lg:block" />
      </div>
    </div>

    <NavbarSearchModal v-model="searchOpen" :placeholder="searchPlaceholder" />

    <div class="h-px w-full bg-glow-border-soft" />
  </header>
</template>
