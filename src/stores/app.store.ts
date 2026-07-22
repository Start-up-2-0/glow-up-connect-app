import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/types/theme.types'
import {
  applyThemeToDocument,
  persistTheme,
  resolveStoredTheme,
} from '@/utils/themeStorage'

export interface UpgradeModalState {
  open: boolean
  modulo?: string
  mensagem?: string
  planoMinimo?: string
}

export const useAppStore = defineStore('app', () => {
  /** Drawer mobile (overlay) */
  const sidebarOpen = ref(false)
  /** Sidebar desktop recolhida (ícones only) */
  const sidebarCollapsed = ref(false)
  const theme = ref<Theme>('dark')
  const upgradeModal = ref<UpgradeModalState>({ open: false })

  const isDark = computed(() => theme.value === 'dark')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(value: boolean) {
    sidebarOpen.value = value
  }

  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      sidebarOpen.value = false
    }
  }

  function applyTheme(value: Theme) {
    theme.value = value
    applyThemeToDocument(value)
    persistTheme(value)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function hydrateTheme() {
    applyTheme(resolveStoredTheme())
  }

  function openUpgradeModal(payload?: Omit<UpgradeModalState, 'open'>) {
    upgradeModal.value = { open: true, ...payload }
  }

  function closeUpgradeModal() {
    upgradeModal.value = { open: false }
  }

  return {
    sidebarOpen,
    sidebarCollapsed,
    theme,
    isDark,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    closeSidebarOnMobile,
    applyTheme,
    toggleTheme,
    hydrateTheme,
    upgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
  }
})

export { applyThemeToDocument } from '@/utils/themeStorage'
export type { Theme } from '@/types/theme.types'
