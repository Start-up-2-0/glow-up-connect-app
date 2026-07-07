<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroChartEntradasSaidas from '@/components/financeiro/FinanceiroChartEntradasSaidas.vue'
import FinanceiroChartFluxo from '@/components/financeiro/FinanceiroChartFluxo.vue'
import FinanceiroChartFormaPagamento from '@/components/financeiro/FinanceiroChartFormaPagamento.vue'
import ExportarDropdown from '@/components/financeiro/ExportarDropdown.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { ExportFormato, FluxoCaixa, LancamentoCaixa, RelatorioAnalitico } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')

const tipoRelatorio = ref('analitico')
const relatorio = ref<LancamentoCaixa[]>([])
const analitico = ref<RelatorioAnalitico | null>(null)
const fluxo = ref<FluxoCaixa | null>(null)
const loading = ref(false)

const tipoOptions = [
  { value: 'analitico', label: 'Analítico' },
  { value: 'fluxo', label: 'Fluxo de caixa' },
  { value: 'profissional', label: 'Por profissional' },
  { value: 'forma', label: 'Por forma pagamento' },
]

const entradasSaidas = computed(() => ({
  entradas: analitico.value?.faturamentoTotal ?? 0,
  saidas: relatorio.value
    .filter((l) => l.tipo.toLowerCase().includes('saida') || l.tipo.toLowerCase().includes('sangria'))
    .reduce((s, l) => s + l.valor, 0),
}))

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = apiFiltro.value
    const [lista, resumo, fluxoData] = await Promise.all([
      caixaService.listarRelatorioFinanceiro(estabelecimentoId.value, filtro),
      caixaService.obterRelatorioAnalitico(estabelecimentoId.value, filtro),
      caixaService.obterFluxoCaixa(estabelecimentoId.value, filtro),
    ])
    relatorio.value = lista
    analitico.value = resumo
    fluxo.value = fluxoData
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

async function exportar(formato: ExportFormato) {
  if (!estabelecimentoId.value) return
  try {
    const response = await caixaService.exportarRelatorio(
      estabelecimentoId.value,
      formato,
      apiFiltro.value,
    )
    const ext = formato === 'xlsx' ? 'xlsx' : formato === 'pdf' ? 'pdf' : 'csv'
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-financeiro.${ext}`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

function imprimir() {
  window.print()
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Relatórios"
      subtitle="Análises e exportação de dados financeiros."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <SegmentedControl v-model="tipoRelatorio" :options="tipoOptions" aria-label="Tipo de relatório" />
        <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </template>
      <template #actions>
        <ExportarDropdown class="financeiro-no-print" @export="exportar" @print="imprimir" />
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="analitico">
      <div v-if="tipoRelatorio === 'analitico'" class="financeiro-kpi-grid">
        <FinanceiroKpiCard label="Faturamento" :value="formatCurrency(analitico.faturamentoTotal)" />
        <FinanceiroKpiCard label="Atendimentos pagos" :value="String(analitico.atendimentosPagos)" />
        <FinanceiroKpiCard label="Ticket médio" :value="formatCurrency(analitico.ticketMedio)" />
      </div>

      <div v-if="tipoRelatorio === 'analitico'" class="grid gap-4 lg:grid-cols-2">
        <FinanceiroChartEntradasSaidas
          :entradas="entradasSaidas.entradas"
          :saidas="entradasSaidas.saidas"
        />
        <FinanceiroChartFormaPagamento :items="analitico.porFormaPagamento" />
      </div>

      <div v-if="tipoRelatorio === 'fluxo' && fluxo">
        <FinanceiroChartFluxo :dias="fluxo.dias" />
        <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">
          Saldo final: {{ formatCurrency(fluxo.saldoFinal) }}
        </p>
      </div>

      <div v-if="tipoRelatorio === 'profissional'" class="financeiro-table-wrap">
        <FinanceiroEmptyState
          v-if="analitico.porProfissional.length === 0"
          title="Sem dados"
          description="Não há faturamento por profissional no período."
        />
        <table v-else class="financeiro-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Atendimentos</th>
              <th class="text-right">Faturamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in analitico.porProfissional" :key="p.profissionalId">
              <td>{{ p.nomePublico }}</td>
              <td>{{ p.quantidade }}</td>
              <td class="text-right font-medium">{{ formatCurrency(p.faturamento) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="tipoRelatorio === 'forma'" class="financeiro-table-wrap">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Forma</th>
              <th>Quantidade</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in analitico.porFormaPagamento" :key="f.formaPagamento">
              <td>{{ f.formaPagamento }}</td>
              <td>{{ f.quantidade }}</td>
              <td class="text-right font-medium">{{ formatCurrency(f.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="tipoRelatorio === 'analitico'" class="financeiro-table-wrap mt-6">
        <p class="border-b border-glow-border-soft px-5 py-3 font-satoshi font-bold text-glow-text">
          Lançamentos
        </p>
        <FinanceiroEmptyState
          v-if="relatorio.length === 0"
          title="Sem dados"
          description="Não há lançamentos no período."
        />
        <table v-else class="financeiro-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in relatorio" :key="l.id">
              <td class="text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
              <td>{{ l.tipo }}</td>
              <td>{{ l.descricao }}</td>
              <td class="text-right font-medium">{{ formatCurrency(l.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
