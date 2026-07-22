<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import FinanceiroRecentMovimentos from '@/components/financeiro/FinanceiroRecentMovimentos.vue'
import MovimentoFormModal from '@/components/financeiro/MovimentoFormModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
import {
  calcularVariacaoPercentual,
  createEmptyFinanceiroDashboard,
  getPreviousPeriodFilter,
  isFinanceiroDashboardEmptyResponse,
  isFinanceiroDashboardSemMovimentacao,
} from '@/utils/financeiroDashboard'
import type { FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload, MovimentoDirecao, MovimentoFinanceiro } from '@/types/negocio/financeiro.types'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')

const dashboard = ref<FinanceiroDashboard | null>(null)
const dashboardAnterior = ref<FinanceiroDashboard | null>(null)
const movimentosRecentes = ref<MovimentoFinanceiro[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const formDirecao = ref<MovimentoDirecao>('entrada')

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
    { id: 'relatorios', label: 'Ver relatórios', icon: 'relatorio' as const },
    { id: 'entradas', label: 'Fluxo de caixa', icon: 'grafico' as const },
  ]
  return items
})

async function carregarMovimentosRecentes(filtro: { inicio?: string; fim?: string }) {
  if (!estabelecimentoId.value) return []

  try {
    const params = {
      inicio: filtro.inicio,
      fim: filtro.fim,
      pagina: 1,
      tamanhoPagina: 5,
    }

    const [entradas, saidas] = await Promise.all([
      financeiroService.listarEntradas(estabelecimentoId.value, params),
      financeiroService.listarSaidas(estabelecimentoId.value, params),
    ])

    return [...entradas.itens, ...saidas.itens]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5)
  } catch {
    return []
  }
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim }
    const filtroAnterior = getPreviousPeriodFilter(filtro)

    const [dash, dashAnterior, recentes] = await Promise.all([
      financeiroService.obterDashboard(estabelecimentoId.value, filtro),
      filtroAnterior
        ? financeiroService.obterDashboard(estabelecimentoId.value, filtroAnterior)
        : Promise.resolve(null),
      carregarMovimentosRecentes(filtro),
    ])

    dashboard.value = dash
    dashboardAnterior.value = dashAnterior
    movimentosRecentes.value = recentes
  } catch (err) {
    if (isFinanceiroDashboardEmptyResponse(err)) {
      dashboard.value = createEmptyFinanceiroDashboard({
        inicio: apiFiltro.value.inicio,
        fim: apiFiltro.value.fim,
      })
      dashboardAnterior.value = null
      movimentosRecentes.value = []
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

function onAcaoRapida(id: string) {
  if (id === 'entrada') abrirForm('entrada')
  else if (id === 'saida') abrirForm('saida')
  else if (id === 'relatorios') router.push(ROUTE_PATHS.FINANCEIRO_RELATORIOS)
  else if (id === 'entradas') router.push(ROUTE_PATHS.FINANCEIRO_ENTRADAS)
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
        <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
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
        @contas="router.push({ path: ROUTE_PATHS.FINANCEIRO_ENTRADAS, query: { status: 'pendente' } })"
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

      <FinanceiroRecentMovimentos
        :itens="movimentosRecentes"
        :loading="loading"
        @ver-todas="router.push(ROUTE_PATHS.FINANCEIRO_ENTRADAS)"
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
