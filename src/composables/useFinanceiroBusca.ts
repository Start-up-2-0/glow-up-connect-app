import { ref, watch } from 'vue'
import { caixaService } from '@/services/caixaService'
import type { FinanceiroBuscaResultado } from '@/types/negocio/caixa.types'
import { useApiError } from '@/composables/useApiError'

export function useFinanceiroBusca(estabelecimentoId: () => number | null) {
  const { resolveError } = useApiError()
  const query = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const resultados = ref<FinanceiroBuscaResultado | null>(null)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function buscar(termo?: string) {
    const id = estabelecimentoId()
    const q = (termo ?? query.value).trim()
    if (!id || q.length < 2) {
      resultados.value = null
      return
    }

    loading.value = true
    error.value = null
    try {
      resultados.value = await caixaService.buscarFinanceiro(id, { q })
    } catch (err) {
      error.value = resolveError(err)
      resultados.value = null
    } finally {
      loading.value = false
    }
  }

  function buscarDebounced(termo: string) {
    query.value = termo
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => void buscar(termo), 350)
  }

  function limpar() {
    query.value = ''
    resultados.value = null
    error.value = null
  }

  watch(
    () => estabelecimentoId(),
    () => limpar(),
  )

  return {
    query,
    loading,
    error,
    resultados,
    buscar,
    buscarDebounced,
    limpar,
  }
}
