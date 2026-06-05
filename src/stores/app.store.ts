import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  /** Drawer mobile (overlay) */
  const sidebarOpen = ref(false)
  /** Sidebar desktop recolhida (ícones only) */
  const sidebarCollapsed = ref(false)

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

  return {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    closeSidebarOnMobile,
  }
})
