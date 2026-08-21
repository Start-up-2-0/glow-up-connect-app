import { useGlowGuide } from '@/tutorials/hooks/useGlowGuide'
import { GLOW_GUIDE_FLAGS } from '@/tutorials/config'
import { onMounted } from 'vue'

/** Atalho para páginas: launcher manual (+ sugestão automática se a flag estiver ligada). */
export function usePageTutorial(tutorialId: string) {
  const { start, maybeShowSuggestion } = useGlowGuide()

  onMounted(() => {
    if (GLOW_GUIDE_FLAGS.autoSuggestOnFirstVisit) {
      maybeShowSuggestion(tutorialId)
    }
  })

  function startPageTutorial() {
    void start(tutorialId)
  }

  return { startPageTutorial }
}
