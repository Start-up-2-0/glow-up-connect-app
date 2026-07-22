<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroChartEntradasSaidas from '@/components/financeiro/FinanceiroChartEntradasSaidas.vue'
import MovimentoFormModal from '@/components/financeiro/MovimentoFormModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
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

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    dashboard.value = await financeiroService.obterDashboard(
      estabelecimentoId.value,
      { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim },
    )
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
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <FinanceiroKpiCard label="Saldo atual" :value="formatCurrency(dashboard.saldoAtual)" />
        <FinanceiroKpiCard label="Entradas" :value="formatCurrency(dashboard.totalEntradas)" />
        <FinanceiroKpiCard label="Saídas" :value="formatCurrency(dashboard.totalSaidas)" />
        <FinanceiroKpiCard label="Lucro líquido" :value="formatCurrency(dashboard.lucroLiquido)" />
        <button
          type="button"
          class="text-left"
          @click="router.push({ path: ROUTE_PATHS.FINANCEIRO_ENTRADAS, query: { status: 'pendente' } })"
        >
          <FinanceiroKpiCard
            label="Contas em aberto"
            :value="formatCurrency(dashboard.contasEmAberto)"
            :hint="`${dashboard.quantidadeContasEmAberto} título(s)`"
          />
        </button>
        <button type="button" class="text-left" @click="router.push(ROUTE_PATHS.FINANCEIRO_COMISSOES)">
          <FinanceiroKpiCard
            label="Comissões (período)"
            :value="formatCurrency(dashboard.comissoesPeriodo)"
          />
        </button>
      </div>

      <FinanceiroChartEntradasSaidas
        class="mt-6"
        :entradas="dashboard.totalEntradas"
        :saidas="dashboard.totalSaidas"
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
