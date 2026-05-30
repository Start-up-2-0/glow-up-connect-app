import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(value: boolean) {
    sidebarOpen.value = value
  }

  function closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      sidebarOpen.value = false
    }
  }

  return {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    closeSidebarOnMobile,
  }
})
