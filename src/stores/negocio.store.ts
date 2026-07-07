import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { negocioService } from '@/services/negocioService'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { storage } from '@/utils/storage'
import type { EstabelecimentoAcesso } from '@/types/user.types'

function readEstabelecimentoId(): number | null {
  const raw = storage.get(STORAGE_KEYS.ESTABELECIMENTO_ID)
  if (!raw) return null
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

function persistEstabelecimentoId(id: number | null) {
  if (id === null) {
    storage.remove(STORAGE_KEYS.ESTABELECIMENTO_ID)
  } else {
    storage.set(STORAGE_KEYS.ESTABELECIMENTO_ID, String(id))
  }
}

export const useNegocioStore = defineStore('negocio', () => {
  const estabelecimentos = ref<EstabelecimentoAcesso[]>([])
  const estabelecimentoIdSelecionado = ref<number | null>(readEstabelecimentoId())
  const loading = ref(false)
  const trocandoEstabelecimento = ref(false)
  const contextoVersao = ref(0)

  const estabelecimentoAtivo = computed(() => {
    if (estabelecimentoIdSelecionado.value === null) return null
    return (
      estabelecimentos.value.find(
        (e) => e.estabelecimentoId === estabelecimentoIdSelecionado.value,
      ) ?? null
    )
  })

  const modulos = computed(() => estabelecimentoAtivo.value?.modulos ?? [])
  const permissoes = computed(() => estabelecimentoAtivo.value?.permissoes ?? [])
  const assinaturaAtiva = computed(() => estabelecimentoAtivo.value?.assinaturaAtiva ?? false)
  const assinaturaId = computed(() => estabelecimentoAtivo.value?.assinaturaId ?? null)
  const planoId = computed(() => estabelecimentoAtivo.value?.planoId ?? null)
  const planoNome = computed(() => estabelecimentoAtivo.value?.planoNome ?? null)
  const role = computed(() => estabelecimentoAtivo.value?.role ?? null)
  const limites = computed(
    () =>
      estabelecimentoAtivo.value?.limites ?? {
        profissionais: null,
        servicos: null,
        agendamentos: null,
        usuarios: null,
        agendamentosPorDia: null,
        estabelecimentos: null,
        prioridadeListagemPublica: false,
      },
  )
  const emTrial = computed(() => estabelecimentoAtivo.value?.emTrial ?? false)
  const diasTrial = computed(() => estabelecimentoAtivo.value?.diasTrial ?? null)
  const proximaDataVencimento = computed(
    () => estabelecimentoAtivo.value?.proximaDataVencimento ?? null,
  )
  const prioridadeMarketplace = computed(
    () => estabelecimentoAtivo.value?.limites?.prioridadeListagemPublica ?? false,
  )

  function possuiModulo(modulo: string): boolean {
    return modulos.value.includes(modulo)
  }

  function possuiPermissao(permissao: string): boolean {
    return permissoes.value.includes(permissao)
  }

  function possuiAlgumaPermissao(perms: string[]): boolean {
    if (perms.length === 0) return true
    return perms.some((p) => permissoes.value.includes(p))
  }

  function possuiAlgumModulo(mods: string[]): boolean {
    if (mods.length === 0) return true
    return mods.some((m) => modulos.value.includes(m))
  }

  function podeAcessar(modulo: string, permissao?: string): boolean {
    if (!assinaturaAtiva.value) return false
    if (!possuiModulo(modulo)) return false
    if (permissao && !possuiPermissao(permissao)) return false
    return true
  }

  function selecionarEstabelecimento(id: number) {
    estabelecimentoIdSelecionado.value = id
    persistEstabelecimentoId(id)
  }

  function resolverEstabelecimentoPadrao() {
    if (estabelecimentos.value.length === 0) {
      estabelecimentoIdSelecionado.value = null
      persistEstabelecimentoId(null)
      return
    }

    const storedId = estabelecimentoIdSelecionado.value
    const existe = storedId !== null && estabelecimentos.value.some((e) => e.estabelecimentoId === storedId)

    if (!existe) {
      selecionarEstabelecimento(estabelecimentos.value[0].estabelecimentoId)
    }
  }

  async function fetchEstabelecimentos(force = false) {
    if (estabelecimentos.value.length > 0 && !force) {
      resolverEstabelecimentoPadrao()
      return estabelecimentos.value
    }

    loading.value = true
    try {
      const data = await negocioService.listarEstabelecimentos()
      estabelecimentos.value = data
      resolverEstabelecimentoPadrao()
      return estabelecimentos.value
    } catch {
      estabelecimentos.value = []
      estabelecimentoIdSelecionado.value = null
      persistEstabelecimentoId(null)
      return estabelecimentos.value
    } finally {
      loading.value = false
    }
  }

  async function trocarEstabelecimento(id: number) {
    const idAnterior = estabelecimentoIdSelecionado.value
    trocandoEstabelecimento.value = true

    try {
      await fetchEstabelecimentos(true)

      const destino = estabelecimentos.value.find((e) => e.estabelecimentoId === id)
      if (!destino) {
        throw new Error('Estabelecimento indisponível para este usuário.')
      }

      selecionarEstabelecimento(id)

      if (idAnterior !== id) {
        contextoVersao.value += 1
      }

      return destino
    } finally {
      trocandoEstabelecimento.value = false
    }
  }

  async function ensureContext() {
    if (estabelecimentos.value.length === 0) {
      await fetchEstabelecimentos(true)
    } else {
      resolverEstabelecimentoPadrao()
    }
    return estabelecimentoAtivo.value
  }

  function patchEstabelecimentoAtivo(patch: Partial<Pick<EstabelecimentoAcesso, 'nome' | 'logo'>>) {
    const id = estabelecimentoIdSelecionado.value
    if (id === null) return
    const index = estabelecimentos.value.findIndex((e) => e.estabelecimentoId === id)
    if (index === -1) return
    estabelecimentos.value[index] = {
      ...estabelecimentos.value[index],
      ...patch,
    }
  }

  function clear() {
    estabelecimentos.value = []
    estabelecimentoIdSelecionado.value = null
    contextoVersao.value = 0
    persistEstabelecimentoId(null)
  }

  return {
    estabelecimentos,
    estabelecimentoIdSelecionado,
    loading,
    trocandoEstabelecimento,
    contextoVersao,
    estabelecimentoAtivo,
    modulos,
    permissoes,
    assinaturaAtiva,
    assinaturaId,
    planoId,
    planoNome,
    role,
    limites,
    emTrial,
    diasTrial,
    proximaDataVencimento,
    prioridadeMarketplace,
    possuiModulo,
    possuiPermissao,
    possuiAlgumaPermissao,
    possuiAlgumModulo,
    podeAcessar,
    selecionarEstabelecimento,
    trocarEstabelecimento,
    fetchEstabelecimentos,
    ensureContext,
    patchEstabelecimentoAtivo,
    clear,
  }
})
