import { computed, onMounted, onUnmounted, ref } from 'vue'
import { resolveLayoutMode } from '@/tutorials/engine/positioning'
import type { TargetRect, TutorialLayoutMode } from '@/tutorials/types'

export function useTutorialLayout(targetRect: () => TargetRect | null) {
  const mode = ref<TutorialLayoutMode>('popover')
  const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const visualOffset = ref(0)

  function update() {
    viewportWidth.value = window.innerWidth
    mode.value = resolveLayoutMode(targetRect())
    if (window.visualViewport) {
      visualOffset.value = Math.max(0, window.innerHeight - window.visualViewport.height)
    } else {
      visualOffset.value = 0
    }
  }

  let debounceTimer = 0
  function onResize() {
    window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(update, 80)
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('scroll', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
    window.visualViewport?.removeEventListener('resize', onResize)
    window.visualViewport?.removeEventListener('scroll', onResize)
    window.clearTimeout(debounceTimer)
  })

  const isSheet = computed(() => mode.value === 'sheet')

  return {
    mode,
    isSheet,
    viewportWidth,
    visualOffset,
    update,
  }
}
