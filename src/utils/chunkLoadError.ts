const STORAGE_KEY = 'guc:chunk-reload'

const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading chunk .+ failed/i

export function isChunkLoadError(error: unknown): boolean {
  if (error == null) return false
  if (typeof error === 'string') return CHUNK_ERROR_RE.test(error)
  if (error instanceof Error) {
    return CHUNK_ERROR_RE.test(`${error.name} ${error.message}`)
  }
  if (typeof error === 'object' && 'message' in error) {
    return CHUNK_ERROR_RE.test(String((error as { message: unknown }).message))
  }
  return CHUNK_ERROR_RE.test(String(error))
}

/** Recarrega a app uma vez para buscar o bundle novo após um deploy. */
export function reloadForUpdatedApp(path?: string): boolean {
  if (typeof window === 'undefined') return false

  const target =
    path ?? `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (sessionStorage.getItem(STORAGE_KEY) === target) {
    sessionStorage.removeItem(STORAGE_KEY)
    return false
  }

  sessionStorage.setItem(STORAGE_KEY, target)
  window.location.assign(target)
  return true
}

export function registerChunkLoadRecovery(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    reloadForUpdatedApp()
  })
}
