<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { redeService } from '@/services/redeService'
import type { RedeResumo } from '@/services/redeService'
import { formatCurrency } from '@/utils/formatters'

const { ready, error: contextError, loading: contextLoading } = useEstabelecimentoView()
const { assinaturaId } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, dateRange, resetPagina } = useFinanceiroFiltros('mes')

const resumo = ref<RedeResumo | null>(null)
const loading = ref(false)

const podeExibir = computed(() => Boolean(assinaturaId.value))

async function load() {
  if (!assinaturaId.value) return
  loading.value = true
  try {
    const range = dateRange.value
    resumo.value = await redeService.obterResumo(
      assinaturaId.value,
      range?.inicio,
      range?.fim,
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

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Painel da rede"
      subtitle="Visão consolidada das unidades do plano Premium."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
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

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <FinanceiroEmptyState
      v-else-if="!podeExibir"
      title="Assinatura não encontrada"
      description="Selecione a unidade matriz com assinatura Premium ativa."
    />
    <LoadingSpinner v-else-if="contextLoading || (loading && !resumo)" />

    <template v-else-if="resumo">
      <div class="financeiro-kpi-grid">
        <FinanceiroKpiCard
          :label="`Unidades${resumo.limiteUnidades ? ` / ${resumo.limiteUnidades}` : ''}`"
          :value="String(resumo.totalUnidades)"
        />
        <FinanceiroKpiCard
          label="Agendamentos no período"
          :value="String(resumo.totalAgendamentosNoPeriodo)"
        />
        <FinanceiroKpiCard
          label="Faturamento no período"
          :value="formatCurrency(resumo.totalFaturamentoPeriodo)"
        />
      </div>

      <div class="space-y-2">
        <div
          v-for="unidade in resumo.unidades"
          :key="unidade.estabelecimentoId"
          class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-glow-border-soft bg-glow-surface px-4 py-3"
        >
          <div>
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ unidade.nome }}</p>
            <p v-if="unidade.ehMatriz" class="text-xs text-glow-gold">Matriz</p>
          </div>
          <div class="text-right font-urbanist text-sm">
            <p class="text-glow-text-subtle">{{ unidade.agendamentosNoPeriodo }} agendamentos</p>
            <p class="font-medium text-glow-text">{{ formatCurrency(unidade.faturamentoPeriodo) }}</p>
          </div>
        </div>
        <FinanceiroEmptyState
          v-if="resumo.unidades.length === 0"
          title="Nenhuma unidade"
          description="Adicione unidades na página de assinatura."
        />
      </div>
    </template>
  </div>
</template>
