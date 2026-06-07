import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { planoService } from '@/services/planoService'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const CACHE_TTL_MS = 5 * 60 * 1000

export const usePlanosStore = defineStore('planos', () => {
  const planos = ref<Plano[]>([])
  const promocao = ref<PromocaoLancamento | null>(null)
  const carregadoEm = ref<number | null>(null)
  const loading = ref(false)

  const promocaoDisponivel = computed(() => promocao.value?.disponivel === true)

  const isCacheValid = computed(() => {
    if (!carregadoEm.value || planos.value.length === 0) return false
    return Date.now() - carregadoEm.value < CACHE_TTL_MS
  })

  function invalidate() {
    carregadoEm.value = null
  }

  async function fetchPlanos(force = false) {
    if (!force && isCacheValid.value) {
      return { planos: planos.value, promocao: promocao.value }
    }

    loading.value = true
    try {
      const data = await planoService.listar()
      planos.value = data.planos
      promocao.value = data.promocaoLancamento
      carregadoEm.value = Date.now()
      return { planos: planos.value, promocao: promocao.value }
    } finally {
      loading.value = false
    }
  }

  function getPlanoById(id: number): Plano | undefined {
    return planos.value.find((p) => p.id === id)
  }

  return {
    planos,
    promocao,
    carregadoEm,
    loading,
    promocaoDisponivel,
    isCacheValid,
    invalidate,
    fetchPlanos,
    getPlanoById,
  }
})
