import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNegocioStore } from '@/stores/negocio.store'

export function useEstabelecimentoView() {
  const negocioStore = useNegocioStore()
  const { estabelecimentoAtivo, estabelecimentoIdSelecionado, ensureContext, loading } =
    useNegocioContext()
  const { contextoVersao } = storeToRefs(negocioStore)
  const ready = ref(false)
  const error = ref<string | null>(null)

  const estabelecimentoId = computed(() => estabelecimentoIdSelecionado.value)

  async function init() {
    error.value = null
    await ensureContext()
    if (!estabelecimentoId.value) {
      error.value = 'Selecione um estabelecimento para continuar.'
      ready.value = false
      return false
    }
    ready.value = true
    return true
  }

  watch(
    [estabelecimentoIdSelecionado, contextoVersao],
    async () => {
      ready.value = false
      await init()
    },
    { immediate: true },
  )

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
