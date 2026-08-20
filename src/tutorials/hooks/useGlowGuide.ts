import { storeToRefs } from 'pinia'
import { useTutorialStore } from '@/stores/tutorial.store'
import { emitTutorialEvent } from '@/tutorials/engine/eventBus'
import { tutorialRegistry } from '@/tutorials/registry'

export function useGlowGuide() {
  const store = useTutorialStore()
  const refs = storeToRefs(store)

  return {
    ...refs,
    start: store.start,
    next: store.next,
    back: store.back,
    skip: store.skip,
    finish: store.finish,
    requestExit: store.requestExit,
    abandon: store.abandon,
    resumePending: store.resumePending,
    restartPending: store.restartPending,
    cancelResumeDialog: store.cancelResumeDialog,
    cancelExitDialog: store.cancelExitDialog,
    maybeShowSuggestion: store.maybeShowSuggestion,
    dismissSuggestion: store.dismissSuggestion,
    acceptSuggestion: store.acceptSuggestion,
    getProgress: store.getProgress,
    emit: emitTutorialEvent,
    registry: tutorialRegistry,
  }
}
