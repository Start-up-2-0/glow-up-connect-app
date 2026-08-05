import { computed, ref } from 'vue'

/** Garante um único popover aberto na shell (notif / user / etc.). */
const activeOverlayId = ref<string | null>(null)

export function useShellOverlay(id: string) {
  const isOpen = computed(() => activeOverlayId.value === id)

  function open() {
    activeOverlayId.value = id
  }

  function close() {
    if (activeOverlayId.value === id) {
      activeOverlayId.value = null
    }
  }

  function toggle() {
    activeOverlayId.value = activeOverlayId.value === id ? null : id
  }

  return { isOpen, open, close, toggle }
}
