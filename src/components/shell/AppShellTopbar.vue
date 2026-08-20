<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, Search, X } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app.store'
import { useDashboardNav } from '@/composables/useDashboardNav'
import { ROUTE_PATHS } from '@/constants/routes'
import AppLogo from '@/components/layout/AppLogo.vue'
import AppNotifications from '@/components/layout/AppNotifications.vue'
import NavbarSearchModal from '@/components/layout/NavbarSearchModal.vue'
import ShellUserMenu from '@/components/shell/ShellUserMenu.vue'

const appStore = useAppStore()
const { searchPlaceholder } = useDashboardNav()

const searchOpen = ref(false)
const menuOpen = computed(() => appStore.sidebarOpen)

function openSidebar() {
  appStore.toggleSidebar()
}

function openSearch() {
  searchOpen.value = true
}

function onGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
  }
}

onMounted(() => document.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => document.removeEventListener('keydown', onGlobalKeydown))
</script>

<template>
  <nav
    class="fixed left-0 right-0 top-0 z-[2020] flex items-center overflow-visible border-b border-glow-border-soft bg-glow-surface px-4"
    style="height: calc(3.5rem + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top)"
  >
    <div class="relative flex h-full w-full items-center justify-between gap-2">
      <!-- Esquerda: menu + logo (logo maior, overflow sem aumentar a barra) -->
      <div class="relative z-10 flex min-w-0 shrink-0 items-center gap-2.5">
        <button
          type="button"
          class="cursor-pointer rounded-lg p-1.5 text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-gold-cta/35 md:hidden"
          aria-controls="drawer-navigation"
          :aria-expanded="menuOpen"
          @click="openSidebar"
        >
          <X v-if="menuOpen" class="size-5" :stroke-width="1.75" />
          <Menu v-else class="size-5" :stroke-width="1.75" />
          <span class="sr-only">Alternar menu</span>
        </button>

        <RouterLink
          :to="ROUTE_PATHS.DASHBOARD"
          class="relative z-10 flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-glow-gold-cta/40"
          aria-label="Ir para o início"
        >
          <!-- PNG com padding interno: altura um pouco acima da barra (56px) para o crest + texto lerem bem -->
          <AppLogo
            logo-class="h-11 w-auto max-w-[148px] object-contain object-left sm:h-12 sm:max-w-[168px]"
          />
        </RouterLink>
      </div>

      <!-- Centro: busca (desktop) -->
      <div
        class="pointer-events-none absolute inset-x-0 hidden justify-center md:flex"
      >
        <div class="pointer-events-auto relative w-full max-w-md px-4 lg:max-w-lg">
          <label for="topbar-search" class="sr-only">Buscar</label>
          <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center pl-3">
            <Search class="size-4 text-glow-text-subtle" :stroke-width="1.75" />
          </div>
          <button
            id="topbar-search"
            type="button"
            class="block w-full rounded-lg border border-glow-border-soft bg-glow-canvas py-1.5 pl-9 pr-3 text-left text-sm font-normal text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text focus:border-glow-gold-cta focus:outline-none focus:ring-2 focus:ring-glow-gold-cta/25"
            @click="openSearch"
          >
            <span class="truncate">{{ searchPlaceholder || 'Buscar…' }}</span>
          </button>
        </div>
      </div>

      <!-- Direita: ações -->
      <div class="relative z-10 flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          class="rounded-lg p-1.5 text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-gold-cta/35 md:hidden"
          aria-label="Buscar"
          @click="openSearch"
        >
          <Search class="size-5" :stroke-width="1.75" />
        </button>

        <AppNotifications size="md" />
        <div class="ml-1">
          <ShellUserMenu avatar-only />
        </div>
      </div>
    </div>

    <NavbarSearchModal v-model="searchOpen" :placeholder="searchPlaceholder" />
  </nav>
</template>
