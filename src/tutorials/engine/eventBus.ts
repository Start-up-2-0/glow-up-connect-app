type TutorialEventHandler = (payload?: unknown) => void

const listeners = new Map<string, Set<TutorialEventHandler>>()

export const tutorialEventBus = {
  on(event: string, handler: TutorialEventHandler): () => void {
    let set = listeners.get(event)
    if (!set) {
      set = new Set()
      listeners.set(event, set)
    }
    set.add(handler)
    return () => {
      set?.delete(handler)
      if (set && set.size === 0) listeners.delete(event)
    }
  },

  emit(event: string, payload?: unknown): void {
    const set = listeners.get(event)
    if (!set) return
    set.forEach((handler) => {
      try {
        handler(payload)
      } catch {
        // não deixa handler quebrado derrubar o engine
      }
    })
  },

  clear(): void {
    listeners.clear()
  },
}

/** API pública para módulos emitirem eventos de domínio. */
export function emitTutorialEvent(event: string, payload?: unknown): void {
  tutorialEventBus.emit(event, payload)
}
