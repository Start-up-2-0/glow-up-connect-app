<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroAtalhosGrid from '@/components/financeiro/FinanceiroAtalhosGrid.vue'
import FinanceiroAlertasBanner from '@/components/financeiro/FinanceiroAlertasBanner.vue'
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar.vue'
import FinanceiroChartEntradasSaidas from '@/components/financeiro/FinanceiroChartEntradasSaidas.vue'
import FinanceiroChartFluxo from '@/components/financeiro/FinanceiroChartFluxo.vue'
import FinanceiroChartFormaPagamento from '@/components/financeiro/FinanceiroChartFormaPagamento.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useFinanceiroBusca } from '@/composables/useFinanceiroBusca'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { FinanceiroResumo, FluxoCaixa, RelatorioAnalitico, SessaoCaixa } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')
const { resultados, buscarDebounced, loading: buscaLoading } = useFinanceiroBusca(() => estabelecimentoId.value)

const resumo = ref<FinanceiroResumo | null>(null)
const fluxo = ref<FluxoCaixa | null>(null)
const analitico = ref<RelatorioAnalitico | null>(null)
const sessao = ref<SessaoCaixa | null>(null)
const contasVencidas = ref(0)
const loading = ref(false)

const atalhos = [
  { label: 'Caixa', description: 'Saldo e lançamentos', to: ROUTE_PATHS.FINANCEIRO_CAIXA },
  { label: 'Movimentações', description: 'Buscar lançamentos', to: ROUTE_PATHS.FINANCEIRO_MOVIMENTACOES },
  { label: 'Contas', description: 'A pagar e receber', to: ROUTE_PATHS.FINANCEIRO_CONTAS },
  { label: 'Comissões', description: 'Regras e extrato', to: ROUTE_PATHS.FINANCEIRO_COMISSOES },
  { label: 'Relatórios', description: 'Análises e exportação', to: ROUTE_PATHS.FINANCEIRO_RELATORIOS },
  { label: 'Conciliação', description: 'Extrato bancário', to: ROUTE_PATHS.FINANCEIRO_CONCILIACAO },
  { label: 'Painel da rede', description: 'Multi-unidade', to: ROUTE_PATHS.FINANCEIRO_REDE },
]

const temResultadosBusca = computed(() => {
  const r = resultados.value
  if (!r) return false
  return r.lancamentos.length + r.contasReceber.length + r.contasPagar.length > 0
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = apiFiltro.value
    const [r, f, a, contas] = await Promise.all([
      caixaService.obterFinanceiroResumo(estabelecimentoId.value, filtro),
      caixaService.obterFluxoCaixa(estabelecimentoId.value, filtro),
      caixaService.obterRelatorioAnalitico(estabelecimentoId.value, filtro),
      caixaService.listarContasReceber(estabelecimentoId.value, 'Vencida'),
    ])
    resumo.value = r
    fluxo.value = f
    analitico.value = a
    contasVencidas.value = contas.length
    try {
      sessao.value = await caixaService.obterSessaoAtual(estabelecimentoId.value)
    } catch {
      sessao.value = null
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
  buscarDebounced(term)
}

function irParaMovimentacoes() {
  void router.push(ROUTE_PATHS.FINANCEIRO_MOVIMENTACOES)
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader title="Financeiro" subtitle="Visão geral das finanças do estabelecimento.">
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
      <template #actions>
        <button type="button" class="financeiro-btn-outline" @click="irParaMovimentacoes">
          Ver movimentações
        </button>
      </template>
    </FinanceiroPageHeader>

    <FinanceiroAlertasBanner
      :contas-vencidas="contasVencidas"
      :sessao-aberta="!!sessao"
      :sessao-desde="sessao ? formatDateTime(sessao.abertoEm) : undefined"
    />

    <div v-if="buscaLoading" class="text-sm text-glow-text-subtle">Buscando...</div>
    <div
      v-else-if="temResultadosBusca && resultados"
      class="rounded-xl border border-glow-border-soft bg-glow-surface p-4"
    >
      <p class="mb-3 font-urbanist text-sm font-semibold text-glow-text">Resultados da busca</p>
      <ul class="space-y-2 font-urbanist text-sm">
        <li v-for="l in resultados.lancamentos" :key="`l-${l.id}`">
          Lançamento: {{ l.descricao }} — {{ formatCurrency(l.valor) }}
        </li>
        <li v-for="c in resultados.contasReceber" :key="`cr-${c.id}`">
          A receber: {{ c.descricao }} — {{ formatCurrency(c.valor) }}
        </li>
        <li v-for="c in resultados.contasPagar" :key="`cp-${c.id}`">
          A pagar: {{ c.fornecedor }} — {{ formatCurrency(c.valor) }}
        </li>
      </ul>
      <button type="button" class="financeiro-btn-outline mt-3" @click="irParaMovimentacoes">
        Ver todos
      </button>
    </div>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="resumo">
      <div class="financeiro-kpi-grid">
        <FinanceiroKpiCard label="Saldo total" :value="formatCurrency(resumo.saldoTotal)" />
        <FinanceiroKpiCard label="Disponível" :value="formatCurrency(resumo.saldoDisponivel)" variant="positive" />
        <FinanceiroKpiCard label="Retido" :value="formatCurrency(resumo.saldoRetido)" />
        <FinanceiroKpiCard label="Entradas no período" :value="formatCurrency(resumo.entradasPeriodo)" variant="positive" />
        <FinanceiroKpiCard label="Saídas no período" :value="formatCurrency(resumo.saidasPeriodo)" variant="negative" />
        <FinanceiroKpiCard label="Lançamentos" :value="String(resumo.totalLancamentosPeriodo)" />
      </div>

      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <FinanceiroChartEntradasSaidas
          :entradas="resumo.entradasPeriodo"
          :saidas="resumo.saidasPeriodo"
        />
        <FinanceiroChartFluxo v-if="fluxo" :dias="fluxo.dias" />
        <FinanceiroChartFormaPagamento
          v-if="analitico"
          :items="analitico.porFormaPagamento"
        />
      </div>

      <div>
        <h2 class="mb-3 font-satoshi text-lg font-bold text-glow-text">Acesso rápido</h2>
        <FinanceiroAtalhosGrid :items="atalhos" />
      </div>
    </template>
  </div>
</template>
