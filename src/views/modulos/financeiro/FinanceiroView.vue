<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { FinanceiroResumo } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const resumo = ref<FinanceiroResumo | null>(null)
const loading = ref(false)
const filtroInicio = ref('')
const filtroFim = ref('')

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro: { inicio?: string; fim?: string } = {}
    if (filtroInicio.value) filtro.inicio = new Date(filtroInicio.value).toISOString()
    if (filtroFim.value) filtro.fim = new Date(filtroFim.value + 'T23:59:59').toISOString()
    resumo.value = await caixaService.obterFinanceiroResumo(estabelecimentoId.value, filtro)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">Financeiro</h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">Visão geral das finanças do estabelecimento.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO_CAIXA"><BaseButton variant="secondary" size="sm">Caixa</BaseButton></RouterLink>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO_COMISSOES"><BaseButton variant="secondary" size="sm">Comissões</BaseButton></RouterLink>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO_RELATORIOS"><BaseButton variant="secondary" size="sm">Relatórios</BaseButton></RouterLink>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO_CONTAS_RECEBER"><BaseButton variant="secondary" size="sm">A receber</BaseButton></RouterLink>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO_CONTAS_PAGAR"><BaseButton variant="secondary" size="sm">A pagar</BaseButton></RouterLink>
      </div>
    </div>

    <FinanceiroPeriodoFiltro v-model:inicio="filtroInicio" v-model:fim="filtroFim" @aplicar="load" />

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || loading" />

    <div v-else-if="resumo" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard title="Saldo total"><p class="font-satoshi text-2xl font-bold text-glow-text">{{ formatCurrency(resumo.saldoTotal) }}</p></BaseCard>
      <BaseCard title="Disponível"><p class="font-satoshi text-2xl font-bold text-green-700">{{ formatCurrency(resumo.saldoDisponivel) }}</p></BaseCard>
      <BaseCard title="Retido"><p class="font-satoshi text-2xl font-bold text-glow-text-subtle">{{ formatCurrency(resumo.saldoRetido) }}</p></BaseCard>
      <BaseCard title="Entradas no período"><p class="font-satoshi text-xl font-bold text-glow-text">{{ formatCurrency(resumo.entradasPeriodo) }}</p></BaseCard>
      <BaseCard title="Saídas no período"><p class="font-satoshi text-xl font-bold text-glow-text">{{ formatCurrency(resumo.saidasPeriodo) }}</p></BaseCard>
      <BaseCard title="Lançamentos"><p class="font-satoshi text-xl font-bold text-glow-text">{{ resumo.totalLancamentosPeriodo }}</p></BaseCard>
    </div>
  </div>
</template>
