<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroDashKpis from '@/components/financeiro/dashboard/FinanceiroDashKpis.vue'
import FinanceiroSaldoCard from '@/components/financeiro/dashboard/FinanceiroSaldoCard.vue'
import FinanceiroComplementos from '@/components/financeiro/dashboard/FinanceiroComplementos.vue'
import FinanceiroFluxoChart from '@/components/financeiro/dashboard/FinanceiroFluxoChart.vue'
import FinanceiroMovimentosRecentes from '@/components/financeiro/dashboard/FinanceiroMovimentosRecentes.vue'
import FinanceiroDashboardEmpty from '@/components/financeiro/FinanceiroDashboardEmpty.vue'
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
  buildSaldoSerie,
  buildSemanasFluxo,
  calcularVariacaoPercentual,
  createEmptyFinanceiroDashboard,
  getPreviousPeriodFilter,
  isFinanceiroDashboardEmptyResponse,
  isFinanceiroDashboardSemMovimentacao,
} from '@/utils/financeiroDashboard'
import type { FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload, MovimentoDirecao } from '@/types/negocio/financeiro.types'
import type { ExportFormato, FluxoCaixa } from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

const { startPageTutorial } = usePageTutorial('finance')

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
const fluxo = ref<FluxoCaixa | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const formDirecao = ref<MovimentoDirecao>('entrada')
const movimentosRef = ref<{ reload: () => Promise<void> } | null>(null)

function resolveAbaFromQuery(aba?: LocationQueryValue | LocationQueryValue[]): MovimentoDirecao {
  const value = Array.isArray(aba) ? aba[0] : aba
  return value === 'saidas' ? 'saida' : 'entrada'
}

const abaMovimentos = ref<MovimentoDirecao>(resolveAbaFromQuery(route.query.aba))
const statusMovimentos = computed(() =>
  typeof route.query.status === 'string' ? route.query.status : '',
)

const podeGerenciar = () => possuiPermissao('CaixaGerenciar')

const semMovimentacao = computed(() =>
  dashboard.value ? isFinanceiroDashboardSemMovimentacao(dashboard.value) : false,
)

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

const saldoTrend = computed(() =>
  dashboard.value && dashboardAnterior.value
    ? calcularVariacaoPercentual(dashboard.value.saldoAtual, dashboardAnterior.value.saldoAtual)
    : null,
)

const saldoSerie = computed(() =>
  buildSaldoSerie(fluxo.value, dashboard.value?.saldoAtual ?? 0),
)

const semanasFluxo = computed(() =>
  buildSemanasFluxo(
    fluxo.value,
    dashboard.value?.totalEntradas ?? 0,
    dashboard.value?.totalSaidas ?? 0,
  ),
)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim }
    const filtroAnterior = getPreviousPeriodFilter(filtro)

    const [dash, dashAnterior, fluxoRes] = await Promise.all([
      financeiroService.obterDashboard(estabelecimentoId.value, filtro),
      filtroAnterior
        ? financeiroService.obterDashboard(estabelecimentoId.value, filtroAnterior)
        : Promise.resolve(null),
      caixaService.obterFluxoCaixa(estabelecimentoId.value, filtro).catch(() => null),
    ])

    dashboard.value = dash
    dashboardAnterior.value = dashAnterior
    fluxo.value = fluxoRes
  } catch (err) {
    if (isFinanceiroDashboardEmptyResponse(err)) {
      dashboard.value = createEmptyFinanceiroDashboard({
        inicio: apiFiltro.value.inicio,
        fim: apiFiltro.value.fim,
      })
      dashboardAnterior.value = null
      fluxo.value = null
      return
    }
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function reloadAll() {
  await load()
  await movimentosRef.value?.reload()
}

function onPresetChange() {
  resetPagina()
  if (periodPreset.value !== 'custom') void load()
}

function abrirForm(direcao: MovimentoDirecao) {
  formDirecao.value = direcao
  formOpen.value = true
}

function setAbaMovimentos(aba: MovimentoDirecao) {
  if (abaMovimentos.value === aba) return
  abaMovimentos.value = aba
}

function filtrarContasAbertas() {
  abaMovimentos.value = 'entrada'
  void router.replace({
    path: ROUTE_PATHS.FINANCEIRO,
    query: { ...route.query, aba: 'entradas', status: 'pendente' },
  })
  void nextTick(() => {
    document.getElementById('financeiro-movimentos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function limparStatusFiltro() {
  if (!route.query.status) return
  const query = { ...route.query }
  delete query.status
  void router.replace({ path: ROUTE_PATHS.FINANCEIRO, query })
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
    await reloadAll()
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
  <div :class="[FINANCEIRO_PAGE_CLASS, 'space-y-5']" data-tour="finance-page">
    <header class="space-y-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
            Financeiro
          </h1>
          <p class="mt-1.5 max-w-xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
            Situação financeira do período — entradas, saídas, saldo e evolução.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
          <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
          <template v-if="podeGerenciar()">
            <button type="button" class="financeiro-btn-outline" @click="abrirForm('saida')">
              <Plus class="size-4" aria-hidden="true" />
              Nova saída
            </button>
            <button type="button" class="financeiro-btn-primary" @click="abrirForm('entrada')">
              <Plus class="size-4" aria-hidden="true" />
              Nova entrada
            </button>
          </template>
        </div>
      </div>

      <div class="flex flex-wrap items-end justify-between gap-3">
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

    <template v-else-if="dashboard && !contextLoading && !loading">
      <!-- 1. Indicadores principais -->
      <FinanceiroDashKpis
        :receita="formatCurrency(dashboard.totalEntradas)"
        :despesas="formatCurrency(dashboard.totalSaidas)"
        :lucro="formatCurrency(dashboard.lucroLiquido)"
        :receita-trend="entradasTrend"
        :despesas-trend="saidasTrend"
        :lucro-trend="lucroTrend"
        trend-label="vs período anterior"
      />

      <FinanceiroDashboardEmpty
        v-if="semMovimentacao"
        :show-actions="podeGerenciar()"
        @nova-entrada="abrirForm('entrada')"
        @nova-saida="abrirForm('saida')"
      />

      <!-- 2. Saúde financeira + complementos -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <div class="lg:col-span-8">
          <FinanceiroSaldoCard
            class="h-full"
            :saldo="formatCurrency(dashboard.saldoAtual)"
            :serie="saldoSerie"
            :trend="saldoTrend"
            :empty="semMovimentacao && !saldoSerie.length"
          />
        </div>
        <div class="flex flex-col gap-3 lg:col-span-4">
          <FinanceiroComplementos
            class="flex-1"
            :contas="formatCurrency(dashboard.contasEmAberto)"
            :contas-hint="`${dashboard.quantidadeContasEmAberto} título(s)`"
            :comissoes="formatCurrency(dashboard.comissoesPeriodo)"
            @contas="filtrarContasAbertas"
            @comissoes="router.push(ROUTE_PATHS.FINANCEIRO_COMISSOES)"
          />
        </div>
      </div>

      <!-- 3. Evolução do período -->
      <FinanceiroFluxoChart :semanas="semanasFluxo" :empty="semMovimentacao" />

      <!-- 4. Movimentações (mesmo período global) -->
      <div v-if="statusMovimentos" class="flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-glow-border-soft bg-glow-hover-surface px-3 py-1 font-urbanist text-xs text-glow-text"
        >
          Filtro ativo: status {{ statusMovimentos }}
          <button
            type="button"
            class="font-semibold text-glow-gold-cta hover:underline"
            @click="limparStatusFiltro"
          >
            Limpar
          </button>
        </span>
      </div>

      <FinanceiroMovimentosRecentes
        ref="movimentosRef"
        :direcao="abaMovimentos"
        :inicio="apiFiltro.inicio"
        :fim="apiFiltro.fim"
        :status="statusMovimentos"
        @update:direcao="setAbaMovimentos"
        @changed="load"
      />
    </template>

    <MovimentoFormModal
      v-model="formOpen"
      :direcao="formDirecao"
      :loading="actionLoading"
      @confirm="onCriar"
    />
  </div>
</template>
