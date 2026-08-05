import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Theme } from '@/types/theme.types'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { storage } from '@/utils/storage'
import {
  applyThemeToDocument,
  DEFAULT_THEME,
  persistTheme,
  resolveStoredTheme,
} from '@/utils/themeStorage'

function readSidebarCollapsed(): boolean {
  return storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED) === '1'
}

function persistSidebarCollapsed(value: boolean) {
  storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, value ? '1' : '0')
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
  const sidebarCollapsed = ref(readSidebarCollapsed())
  /** Submenus abertos — preservados ao recolher/expandir */
  const openSubmenuKeys = ref<Set<string>>(new Set())
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
    persistSidebarCollapsed(sidebarCollapsed.value)
  }

  function setSidebarCollapsed(value: boolean) {
    sidebarCollapsed.value = value
    persistSidebarCollapsed(value)
  }

  function toggleSubmenu(key: string) {
    openSubmenuKeys.value = new Set(openSubmenuKeys.value)
    if (openSubmenuKeys.value.has(key)) {
      openSubmenuKeys.value.delete(key)
    } else {
      openSubmenuKeys.value.add(key)
    }
  }

  function setSubmenuOpen(key: string, value: boolean) {
    openSubmenuKeys.value = new Set(openSubmenuKeys.value)
    if (value) {
      openSubmenuKeys.value.add(key)
    } else {
      openSubmenuKeys.value.delete(key)
    }
  }

  function resetSubmenus() {
    openSubmenuKeys.value = new Set()
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

  /**
   * Reseta o tema para o padrão (claro) e remove a escolha do cache do navegador.
   * Usado no logout: o tema vale apenas enquanto o usuário está logado.
   */
  function resetTheme() {
    theme.value = DEFAULT_THEME
    applyThemeToDocument(DEFAULT_THEME)
    storage.remove(STORAGE_KEYS.THEME)
    storage.remove(STORAGE_KEYS.THEME_VERSION)
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
    openSubmenuKeys,
    theme,
    isDark,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    toggleSubmenu,
    setSubmenuOpen,
    resetSubmenus,
    closeSidebarOnMobile,
    applyTheme,
    toggleTheme,
    hydrateTheme,
    resetTheme,
    upgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
  }
})

export { applyThemeToDocument } from '@/utils/themeStorage'
export type { Theme } from '@/types/theme.types'
