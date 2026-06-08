import { computed, onMounted, ref } from 'vue'
import { useNegocioContext } from '@/composables/useNegocioContext'

export function useEstabelecimentoView() {
  const { estabelecimentoAtivo, estabelecimentoIdSelecionado, ensureContext, loading } =
    useNegocioContext()
  const ready = ref(false)
  const error = ref<string | null>(null)

  const estabelecimentoId = computed(() => estabelecimentoIdSelecionado.value)

  async function init() {
    error.value = null
    await ensureContext()
    if (!estabelecimentoId.value) {
      error.value = 'Selecione um estabelecimento para continuar.'
      return false
    }
    ready.value = true
    return true
  }

  onMounted(async () => {
    await init()
  })

  return {
    estabelecimentoAtivo,
    estabelecimentoId,
    ensureContext,
    loading,
    ready,
    error,
    init,
  }
}
