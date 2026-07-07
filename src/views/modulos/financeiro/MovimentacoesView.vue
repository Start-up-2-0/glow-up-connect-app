<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroPagination from '@/components/financeiro/FinanceiroPagination.vue'
import MovimentacaoDetalheDrawer from '@/components/financeiro/MovimentacaoDetalheDrawer.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { LancamentoCaixa } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const {
  periodPreset,
  inicioCustom,
  fimCustom,
  busca,
  pagina,
  tamanhoPagina,
  apiFiltro,
  resetPagina,
} = useFinanceiroFiltros('mes')

const lancamentos = ref<LancamentoCaixa[]>([])
const total = ref(0)
const loading = ref(false)
const drawerOpen = ref(false)
const lancamentoSelecionado = ref<LancamentoCaixa | null>(null)

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(total.value / tamanhoPagina.value)),
)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { ...apiFiltro.value, q: busca.value.trim() || undefined }
    if (filtro.q && filtro.q.length >= 2) {
      const resultado = await caixaService.buscarFinanceiro(estabelecimentoId.value, {
        q: filtro.q,
        tipo: 'lancamento',
      })
      lancamentos.value = resultado.lancamentos
      total.value = resultado.lancamentos.length
    } else {
      const resultado = await caixaService.listarLancamentos(estabelecimentoId.value, filtro)
      lancamentos.value = resultado.itens
      total.value = resultado.total
    }
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function onPresetChange() {
  resetPagina()
  if (periodPreset.value !== 'custom') void load()
}

function onSearch(term: string) {
  busca.value = term
  resetPagina()
  void load()
}

function abrirDetalhe(l: LancamentoCaixa) {
  lancamentoSelecionado.value = l
  drawerOpen.value = true
}

function paginaAnterior() {
  if (pagina.value > 1) {
    pagina.value -= 1
    void load()
  }
}

function proximaPagina() {
  if (pagina.value < totalPaginas.value) {
    pagina.value += 1
    void load()
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Movimentações"
      subtitle="Busque e consulte lançamentos do caixa."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <FinanceiroSearchBar @search="onSearch" />
        <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <div class="financeiro-table-wrap">
        <FinanceiroEmptyState
          v-if="lancamentos.length === 0"
          title="Nenhuma movimentação"
          description="Ajuste o período ou termo de busca."
        />
        <table v-else class="financeiro-table hidden md:table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th class="text-right">Valor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lancamentos" :key="l.id">
              <td class="text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
              <td>{{ l.tipo }}</td>
              <td>{{ l.descricao }}</td>
              <td class="text-right font-medium">{{ formatCurrency(l.valor) }}</td>
              <td class="text-right">
                <button type="button" class="financeiro-btn-outline" @click="abrirDetalhe(l)">
                  Detalhe
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="space-y-3 p-3 md:hidden">
          <button
            v-for="l in lancamentos"
            :key="l.id"
            type="button"
            class="financeiro-table__row-card w-full text-left"
            @click="abrirDetalhe(l)"
          >
            <p class="text-xs text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</p>
            <p class="font-medium">{{ l.descricao }}</p>
            <p class="font-bold">{{ formatCurrency(l.valor) }}</p>
          </button>
        </div>
      </div>

      <FinanceiroPagination
        v-if="lancamentos.length > 0"
        :pagina="pagina"
        :total-paginas="totalPaginas"
        :total="total"
        @anterior="paginaAnterior"
        @proxima="proximaPagina"
      />
    </template>

    <MovimentacaoDetalheDrawer
      v-model="drawerOpen"
      :lancamento="lancamentoSelecionado"
    />
  </div>
</template>
