<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroSummaryBar from '@/components/financeiro/FinanceiroSummaryBar.vue'
import FinanceiroDashboardHero from '@/components/financeiro/FinanceiroDashboardHero.vue'
import FinanceiroMetricStrip from '@/components/financeiro/FinanceiroMetricStrip.vue'
import FinanceiroDashboardEmpty from '@/components/financeiro/FinanceiroDashboardEmpty.vue'
import FinanceiroChartEntradasSaidas from '@/components/financeiro/FinanceiroChartEntradasSaidas.vue'
import FinanceiroQuickActions from '@/components/financeiro/FinanceiroQuickActions.vue'
import MovimentosListPage from '@/components/financeiro/MovimentosListPage.vue'
import ExportarDropdown from '@/components/financeiro/ExportarDropdown.vue'
import MovimentoFormModal from '@/components/financeiro/MovimentoFormModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
import { caixaService } from '@/services/caixaService'
import {
  calcularVariacaoPercentual,
  createEmptyFinanceiroDashboard,
  getPreviousPeriodFilter,
  isFinanceiroDashboardEmptyResponse,
  isFinanceiroDashboardSemMovimentacao,
} from '@/utils/financeiroDashboard'
import type { FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload, MovimentoDirecao } from '@/types/negocio/financeiro.types'
import type { ExportFormato } from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const route = useRoute()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')

const dashboard = ref<FinanceiroDashboard | null>(null)
const dashboardAnterior = ref<FinanceiroDashboard | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const formDirecao = ref<MovimentoDirecao>('entrada')

function resolveAbaFromQuery(aba?: LocationQueryValue | LocationQueryValue[]): MovimentoDirecao {
  const value = Array.isArray(aba) ? aba[0] : aba
  return value === 'saidas' ? 'saida' : 'entrada'
}

const abaMovimentos = ref<MovimentoDirecao>(resolveAbaFromQuery(route.query.aba))

const podeGerenciar = () => possuiPermissao('CaixaGerenciar')

const semMovimentacao = computed(() =>
  dashboard.value ? isFinanceiroDashboardSemMovimentacao(dashboard.value) : false,
)

const lucroPositivo = computed(() => (dashboard.value?.lucroLiquido ?? 0) >= 0)

const entradasTrend = computed(() =>
  dashboard.value && dashboardAnterior.value
    ? calcularVariacaoPercentual(dashboard.value.totalEntradas, dashboardAnterior.value.totalEntradas)
    : null,
)

const saidasTrend = computed(() =>
  dashboard.value && dashboardAnterior.value
    ? calcularVariacaoPercentual(dashboard.value.totalSaidas, dashboardAnterior.value.totalSaidas)
    : null,
)

const lucroTrend = computed(() =>
  dashboard.value && dashboardAnterior.value
    ? calcularVariacaoPercentual(dashboard.value.lucroLiquido, dashboardAnterior.value.lucroLiquido)
    : null,
)

const acoesRapidas = computed(() => {
  const items = [
    { id: 'entrada', label: 'Nova venda', icon: 'venda' as const },
    { id: 'saida', label: 'Nova despesa', icon: 'despesa' as const },
    { id: 'movimentos', label: 'Ver movimentações', icon: 'grafico' as const },
  ]
  return items
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim }
    const filtroAnterior = getPreviousPeriodFilter(filtro)

    const [dash, dashAnterior] = await Promise.all([
      financeiroService.obterDashboard(estabelecimentoId.value, filtro),
      filtroAnterior
        ? financeiroService.obterDashboard(estabelecimentoId.value, filtroAnterior)
        : Promise.resolve(null),
    ])

    dashboard.value = dash
    dashboardAnterior.value = dashAnterior
  } catch (err) {
    if (isFinanceiroDashboardEmptyResponse(err)) {
      dashboard.value = createEmptyFinanceiroDashboard({
        inicio: apiFiltro.value.inicio,
        fim: apiFiltro.value.fim,
      })
      dashboardAnterior.value = null
      return
    }
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function onPresetChange() {
  resetPagina()
  if (periodPreset.value !== 'custom') void load()
}

function abrirForm(direcao: MovimentoDirecao) {
  formDirecao.value = direcao
  formOpen.value = true
}

function irParaMovimentos(opts?: { aba?: MovimentoDirecao; status?: string }) {
  if (opts?.aba) abaMovimentos.value = opts.aba

  const query: Record<string, string> = {
    aba: abaMovimentos.value === 'entrada' ? 'entradas' : 'saidas',
  }
  if (opts?.status) query.status = opts.status
  else if (typeof route.query.status === 'string') query.status = route.query.status

  void router.replace({ path: ROUTE_PATHS.FINANCEIRO, query })
  void nextTick(() => {
    document.getElementById('financeiro-movimentos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function setAbaMovimentos(aba: MovimentoDirecao) {
  abaMovimentos.value = aba
  const query = { ...route.query, aba: aba === 'entrada' ? 'entradas' : 'saidas' }
  void router.replace({ path: ROUTE_PATHS.FINANCEIRO, query })
}

function onAcaoRapida(id: string) {
  if (id === 'entrada') abrirForm('entrada')
  else if (id === 'saida') abrirForm('saida')
  else if (id === 'movimentos') irParaMovimentos()
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

async function onCriar(payload: CriarMovimentoPayload) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    if (formDirecao.value === 'entrada') {
      await financeiroService.criarEntrada(estabelecimentoId.value, payload)
      notifications.push('success', 'Entrada registrada.')
    } else {
      await financeiroService.criarSaida(estabelecimentoId.value, payload)
      notifications.push('success', 'Saída registrada.')
    }
    formOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })

watch(
  () => route.query.aba,
  (aba) => {
    abaMovimentos.value = resolveAbaFromQuery(aba)
  },
)
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <header class="financeiro-dashboard-header">
      <div class="financeiro-dashboard-header__top">
        <div>
          <h1 class="financeiro-page__title">Financeiro</h1>
          <p class="financeiro-page__subtitle">Visão geral do seu negócio.</p>
        </div>
        <div v-if="podeGerenciar()" class="financeiro-dashboard-header__actions">
          <BaseButton variant="secondary" @click="abrirForm('saida')">+ Nova saída</BaseButton>
          <BaseButton @click="abrirForm('entrada')">+ Nova entrada</BaseButton>
        </div>
      </div>

      <div class="financeiro-dashboard-header__toolbar">
        <div class="flex flex-wrap items-end gap-3">
          <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
          <FinanceiroPeriodoFiltro
            v-if="periodPreset === 'custom'"
            v-model:inicio="inicioCustom"
            v-model:fim="fimCustom"
            @aplicar="load"
          />
        </div>
        <ExportarDropdown
          v-if="dashboard"
          class="financeiro-no-print"
          @export="exportar"
          @print="imprimir"
        />
      </div>
    </header>

    <ContentAlert v-if="contextError" variant="error" :message="contextError" />
    <LoadingSpinner v-else-if="contextLoading || loading" />

    <template v-else-if="dashboard">
      <FinanceiroSummaryBar
        :entradas="formatCurrency(dashboard.totalEntradas)"
        :saidas="formatCurrency(dashboard.totalSaidas)"
        :lucro="formatCurrency(dashboard.lucroLiquido)"
        :lucro-positivo="lucroPositivo"
      />

      <FinanceiroDashboardHero
        :saldo="formatCurrency(dashboard.saldoAtual)"
        :entradas="formatCurrency(dashboard.totalEntradas)"
        :saidas="formatCurrency(dashboard.totalSaidas)"
        :lucro="formatCurrency(dashboard.lucroLiquido)"
        :lucro-positivo="lucroPositivo"
        :lucro-trend="lucroTrend"
        :entradas-trend="entradasTrend"
        :saidas-trend="saidasTrend"
        trend-label="vs período anterior"
      />

      <FinanceiroMetricStrip
        :lucro="formatCurrency(dashboard.lucroLiquido)"
        :lucro-positivo="lucroPositivo"
        :lucro-trend="lucroTrend"
        :contas="formatCurrency(dashboard.contasEmAberto)"
        :contas-hint="`${dashboard.quantidadeContasEmAberto} título(s)`"
        :comissoes="formatCurrency(dashboard.comissoesPeriodo)"
        @contas="irParaMovimentos({ aba: 'entrada', status: 'pendente' })"
        @comissoes="router.push(ROUTE_PATHS.FINANCEIRO_COMISSOES)"
      />

      <FinanceiroDashboardEmpty
        v-if="semMovimentacao"
        :show-actions="podeGerenciar()"
        @nova-entrada="abrirForm('entrada')"
        @nova-saida="abrirForm('saida')"
      />

      <FinanceiroQuickActions
        v-if="podeGerenciar()"
        :actions="acoesRapidas"
        @action="onAcaoRapida"
      />

      <FinanceiroChartEntradasSaidas
        :entradas="dashboard.totalEntradas"
        :saidas="dashboard.totalSaidas"
        :empty="semMovimentacao"
      />

      <section id="financeiro-movimentos" class="financeiro-movimentos-panel">
        <div class="financeiro-movimentos-panel__header">
          <div>
            <h2 class="financeiro-movimentos-panel__title">Movimentações</h2>
            <p class="financeiro-movimentos-panel__subtitle">
              Entradas e saídas do período, com filtros e exportação.
            </p>
          </div>
          <div class="financeiro-movimentos-panel__tabs financeiro-no-print" role="tablist">
            <button
              type="button"
              role="tab"
              class="financeiro-movimentos-panel__tab"
              :class="{ 'financeiro-movimentos-panel__tab--active': abaMovimentos === 'entrada' }"
              :aria-selected="abaMovimentos === 'entrada'"
              @click="setAbaMovimentos('entrada')"
            >
              Entradas
            </button>
            <button
              type="button"
              role="tab"
              class="financeiro-movimentos-panel__tab"
              :class="{ 'financeiro-movimentos-panel__tab--active': abaMovimentos === 'saida' }"
              :aria-selected="abaMovimentos === 'saida'"
              @click="setAbaMovimentos('saida')"
            >
              Saídas
            </button>
          </div>
        </div>

        <MovimentosListPage
          :key="abaMovimentos"
          :direcao="abaMovimentos"
          embedded
        />
      </section>
    </template>

    <MovimentoFormModal
      v-model="formOpen"
      :direcao="formDirecao"
      :loading="actionLoading"
      @confirm="onCriar"
    />
  </div>
</template>
