import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { Theme } from '@/types/theme.types'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

const DEFAULT_THEME: Theme = 'light'

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

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
  const theme = ref<Theme>('light')
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
    localStorage.setItem(STORAGE_KEYS.THEME, value)
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function hydrateTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME)
    applyTheme(isTheme(saved) ? saved : DEFAULT_THEME)
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

export { applyThemeToDocument, isTheme }
