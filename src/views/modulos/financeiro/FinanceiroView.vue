<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroDashboardHero from '@/components/financeiro/FinanceiroDashboardHero.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroChartEntradasSaidas from '@/components/financeiro/FinanceiroChartEntradasSaidas.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
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
  createEmptyFinanceiroDashboard,
  isFinanceiroDashboardEmptyResponse,
  isFinanceiroDashboardSemMovimentacao,
} from '@/utils/financeiroDashboard'
import type { FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload, MovimentoDirecao } from '@/types/negocio/financeiro.types'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')

const dashboard = ref<FinanceiroDashboard | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const formDirecao = ref<MovimentoDirecao>('entrada')

const podeGerenciar = () => possuiPermissao('CaixaGerenciar')

const semMovimentacao = computed(() =>
  dashboard.value ? isFinanceiroDashboardSemMovimentacao(dashboard.value) : false,
)

const lucroPositivo = computed(() => (dashboard.value?.lucroLiquido ?? 0) >= 0)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim }
    dashboard.value = await financeiroService.obterDashboard(estabelecimentoId.value, filtro)
  } catch (err) {
    if (isFinanceiroDashboardEmptyResponse(err)) {
      dashboard.value = createEmptyFinanceiroDashboard({
        inicio: apiFiltro.value.inicio,
        fim: apiFiltro.value.fim,
      })
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
    <FinanceiroPageHeader
      title="Financeiro"
      subtitle="Visão geral do seu negócio."
    >
      <template v-if="podeGerenciar()" #actions>
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" @click="abrirForm('saida')">+ Nova saída</BaseButton>
          <BaseButton @click="abrirForm('entrada')">+ Nova entrada</BaseButton>
        </div>
      </template>
      <template #filters>
        <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error" :message="contextError" />
    <LoadingSpinner v-else-if="contextLoading || loading" />

    <template v-else-if="dashboard">
      <FinanceiroEmptyState
        v-if="semMovimentacao"
        title="Nenhuma movimentação neste período"
        description="Seu dashboard está pronto. Registre entradas e saídas para acompanhar saldo, lucro e estatísticas do negócio."
      >
        <template v-if="podeGerenciar()" #action>
          <div class="flex flex-wrap justify-center gap-2">
            <BaseButton @click="abrirForm('entrada')">+ Nova entrada</BaseButton>
            <BaseButton variant="secondary" @click="abrirForm('saida')">+ Nova saída</BaseButton>
          </div>
        </template>
      </FinanceiroEmptyState>

      <div class="financeiro-dashboard-grid">
        <FinanceiroDashboardHero
          class="financeiro-dashboard-grid__hero"
          :saldo="formatCurrency(dashboard.saldoAtual)"
          :lucro-liquido="formatCurrency(dashboard.lucroLiquido)"
          :lucro-positivo="lucroPositivo"
        />

        <FinanceiroKpiCard
          class="financeiro-dashboard-grid__entrada"
          label="Entradas"
          accent="green"
          :value="formatCurrency(dashboard.totalEntradas)"
          variant="positive"
        />
        <FinanceiroKpiCard
          class="financeiro-dashboard-grid__saida"
          label="Saídas"
          accent="red"
          :value="formatCurrency(dashboard.totalSaidas)"
          variant="negative"
        />

        <FinanceiroKpiCard
          label="Lucro líquido"
          accent="gold"
          :value="formatCurrency(dashboard.lucroLiquido)"
          :variant="lucroPositivo ? 'positive' : 'negative'"
        />
        <button
          type="button"
          class="text-left"
          @click="router.push({ path: ROUTE_PATHS.FINANCEIRO_ENTRADAS, query: { status: 'pendente' } })"
        >
          <FinanceiroKpiCard
            label="Contas em aberto"
            accent="blue"
            :value="formatCurrency(dashboard.contasEmAberto)"
            :hint="`${dashboard.quantidadeContasEmAberto} título(s)`"
          />
        </button>
        <button type="button" class="text-left" @click="router.push(ROUTE_PATHS.FINANCEIRO_COMISSOES)">
          <FinanceiroKpiCard
            label="Comissões (período)"
            accent="neutral"
            :value="formatCurrency(dashboard.comissoesPeriodo)"
          />
        </button>
      </div>

      <FinanceiroChartEntradasSaidas
        class="mt-6"
        :entradas="dashboard.totalEntradas"
        :saidas="dashboard.totalSaidas"
        :empty="semMovimentacao"
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
