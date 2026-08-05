import { storeToRefs } from 'pinia'
import { useLoadingStore, type LoadingMode } from '@/stores/loading.store'

export interface LoadingOpenOptions {
  message?: string
  progress?: number | null
  mode?: LoadingMode
}

/**
 * Sistema global de loading premium.
 *
 * Uso:
 *   const loading = useLoading()
 *   loading.open({ message: 'Salvando alterações...' })
 *   loading.setMessage('Carregando clientes...')
 *   loading.setProgress(60)
 *   loading.close()
 */
export function useLoading() {
  const store = useLoadingStore()
  const { visible, message, progress, mode } = storeToRefs(store)

  return {
    visible,
    message,
    progress,
    mode,
    open: (options?: LoadingOpenOptions) => store.open(options),
    close: () => store.close(),
    show: (options?: LoadingOpenOptions) => store.show(options),
    hide: () => store.hide(),
    start: (message?: string) => store.start(message),
    finish: () => store.finish(),
    setMessage: (message: string) => store.setMessage(message),
    setProgress: (value: number | null) => store.setProgress(value),
    setMode: (mode: LoadingMode) => store.setMode(mode),
  }
}
