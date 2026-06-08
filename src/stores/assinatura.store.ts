import { defineStore } from 'pinia'
import { ref } from 'vue'
import { assinaturaService } from '@/services/assinaturaService'
import { useNegocioStore } from './negocio.store'
import { usePlanosStore } from './planos.store'
import type {
  Assinatura,
  CobrancaAssinatura,
  CriarAssinaturaPayload,
  TrocarPlanoPayload,
} from '@/types/assinatura.types'

export const useAssinaturaStore = defineStore('assinatura', () => {
  const assinatura = ref<Assinatura | null>(null)
  const cobrancas = ref<CobrancaAssinatura[]>([])
  const loading = ref(false)
  const cobrancasLoading = ref(false)

  async function criarAssinatura(payload: CriarAssinaturaPayload) {
    loading.value = true
    try {
      const result = await assinaturaService.criar(payload)
      assinatura.value = result
      try {
        await useNegocioStore().fetchEstabelecimentos(true)
      } catch {
        // A assinatura já foi criada; o contexto de negócio será recarregado na view.
      }
      usePlanosStore().invalidate()
      return result
    } finally {
      loading.value = false
    }
  }

  async function trocarPlano(assinaturaId: number, payload: TrocarPlanoPayload) {
    loading.value = true
    try {
      const result = await assinaturaService.trocarPlano(assinaturaId, payload)
      assinatura.value = result
      await useNegocioStore().fetchEstabelecimentos(true)
      usePlanosStore().invalidate()
      return result
    } finally {
      loading.value = false
    }
  }

  async function cancelar(assinaturaId: number) {
    loading.value = true
    try {
      await assinaturaService.cancelar(assinaturaId)
      assinatura.value = null
      await useNegocioStore().fetchEstabelecimentos(true)
    } finally {
      loading.value = false
    }
  }

  async function fetchAtual(estabelecimentoId: number) {
    loading.value = true
    try {
      const data = await assinaturaService.obterAtual(estabelecimentoId)
      assinatura.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchCobrancas(assinaturaId: number) {
    cobrancasLoading.value = true
    try {
      const data = await assinaturaService.listarCobrancas(assinaturaId)
      cobrancas.value = [...data].sort((a, b) => b.numeroCiclo - a.numeroCiclo)
      return cobrancas.value
    } finally {
      cobrancasLoading.value = false
    }
  }

  function setAssinatura(value: Assinatura | null) {
    assinatura.value = value
  }

  function clear() {
    assinatura.value = null
    cobrancas.value = []
  }

  return {
    assinatura,
    cobrancas,
    loading,
    cobrancasLoading,
    criarAssinatura,
    trocarPlano,
    cancelar,
    fetchAtual,
    fetchCobrancas,
    setAssinatura,
    clear,
  }
})
