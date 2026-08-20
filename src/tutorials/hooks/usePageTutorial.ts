import { onMounted } from 'vue'
import { useGlowGuide } from '@/tutorials/hooks/useGlowGuide'

/** Atalho para páginas: launcher + sugestão de 1ª visita. */
export function usePageTutorial(tutorialId: string) {
  const { start, maybeShowSuggestion } = useGlowGuide()

  onMounted(() => {
    maybeShowSuggestion(tutorialId)
  })

  function startPageTutorial() {
    void start(tutorialId)
  }

  return { startPageTutorial }
}
