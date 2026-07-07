<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavbarSearchModal from '@/components/layout/NavbarSearchModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useFinanceiroBusca } from '@/composables/useFinanceiroBusca'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId } = useEstabelecimentoView()
const searchOpen = ref(false)
const { resultados, buscarDebounced } = useFinanceiroBusca(() => estabelecimentoId.value)

const ativo = computed(() => route.path.startsWith(ROUTE_PATHS.FINANCEIRO))

const temResultados = computed(() => {
  const r = resultados.value
  if (!r) return false
  return r.lancamentos.length + r.contasReceber.length + r.contasPagar.length > 0
})

function onKeydown(event: KeyboardEvent) {
  if (!ativo.value) return
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = true
  }
}

function onSearch(query: string) {
  if (!ativo.value) return
  buscarDebounced(query)
}

function irMovimentacoes() {
  searchOpen.value = false
  void router.push(ROUTE_PATHS.FINANCEIRO_MOVIMENTACOES)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <NavbarSearchModal
    v-if="ativo"
    v-model="searchOpen"
    placeholder="Buscar movimentações, contas... (Ctrl+K)"
    @search="onSearch"
  >
    <div v-if="temResultados && resultados" class="space-y-2 font-urbanist text-sm">
      <button
        v-for="l in resultados.lancamentos"
        :key="`l-${l.id}`"
        type="button"
        class="block w-full rounded-lg px-2 py-2 text-left hover:bg-glow-hover-surface"
        @click="irMovimentacoes"
      >
        Lançamento: {{ l.descricao }} — {{ formatCurrency(l.valor) }}
      </button>
      <button
        v-for="c in resultados.contasReceber"
        :key="`cr-${c.id}`"
        type="button"
        class="block w-full rounded-lg px-2 py-2 text-left hover:bg-glow-hover-surface"
        @click="irMovimentacoes"
      >
        A receber: {{ c.descricao }} — {{ formatCurrency(c.valor) }}
      </button>
      <button
        v-for="c in resultados.contasPagar"
        :key="`cp-${c.id}`"
        type="button"
        class="block w-full rounded-lg px-2 py-2 text-left hover:bg-glow-hover-surface"
        @click="irMovimentacoes"
      >
        A pagar: {{ c.fornecedor }} — {{ formatCurrency(c.valor) }}
      </button>
    </div>
    <p v-else class="text-center font-urbanist text-sm text-glow-text-subtle">
      Digite ao menos 2 caracteres para buscar.
    </p>
  </NavbarSearchModal>
</template>
