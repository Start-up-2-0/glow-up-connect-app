import { ref } from 'vue'

const inflight = new Map<string, Promise<unknown>>()

export function useFetchOnce<T>(key: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  async function execute(fetcher: () => Promise<T>, force = false): Promise<T> {
    if (data.value !== null && !force) {
      return data.value
    }

    const existing = inflight.get(key)
    if (existing && !force) {
      return existing as Promise<T>
    }

    loading.value = true
    error.value = null

    const promise = fetcher()
      .then((result) => {
        data.value = result
        return result
      })
      .catch((err) => {
        error.value = err
        throw err
      })
      .finally(() => {
        loading.value = false
        inflight.delete(key)
      })

    inflight.set(key, promise)
    return promise
  }

  function reset() {
    data.value = null
    error.value = null
    inflight.delete(key)
  }

  return { data, loading, error, execute, reset }
}
