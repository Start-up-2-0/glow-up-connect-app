<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { LancamentoCaixa, RelatorioAnalitico } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const relatorio = ref<LancamentoCaixa[]>([])
const analitico = ref<RelatorioAnalitico | null>(null)
const loading = ref(false)
const filtroInicio = ref('')
const filtroFim = ref('')

function filtroAtual() {
  const filtro: { inicio?: string; fim?: string } = {}
  if (filtroInicio.value) filtro.inicio = new Date(filtroInicio.value).toISOString()
  if (filtroFim.value) filtro.fim = new Date(filtroFim.value + 'T23:59:59').toISOString()
  return filtro
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = filtroAtual()
    const [lista, resumo] = await Promise.all([
      caixaService.listarRelatorioFinanceiro(estabelecimentoId.value, filtro),
      caixaService.obterRelatorioAnalitico(estabelecimentoId.value, filtro),
    ])
    relatorio.value = lista
    analitico.value = resumo
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function exportarCsv() {
  if (!estabelecimentoId.value) return
  try {
    const response = await caixaService.exportarRelatorioCsv(estabelecimentoId.value, filtroAtual())
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio-financeiro.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">Relatórios financeiros</h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">Movimentações consolidadas para análise.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="secondary" size="sm" @click="exportarCsv">Exportar CSV</BaseButton>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO"><BaseButton variant="secondary" size="sm">Visão geral</BaseButton></RouterLink>
      </div>
    </div>

    <FinanceiroPeriodoFiltro v-model:inicio="filtroInicio" v-model:fim="filtroFim" @aplicar="load" />

    <div v-if="analitico" class="grid gap-4 sm:grid-cols-3">
      <BaseCard title="Faturamento"><p class="font-satoshi text-xl font-bold">{{ formatCurrency(analitico.faturamentoTotal) }}</p></BaseCard>
      <BaseCard title="Atendimentos pagos"><p class="font-satoshi text-xl font-bold">{{ analitico.atendimentosPagos }}</p></BaseCard>
      <BaseCard title="Ticket médio"><p class="font-satoshi text-xl font-bold">{{ formatCurrency(analitico.ticketMedio) }}</p></BaseCard>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || loading" />

    <BaseCard v-else title="Lançamentos">
      <EmptyState v-if="relatorio.length === 0" title="Sem dados" description="Não há lançamentos no período." />
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[32rem] font-urbanist text-sm">
          <thead>
            <tr class="border-b border-glow-border-soft text-left text-glow-text-subtle">
              <th class="pb-2 pr-4 font-medium">Data</th>
              <th class="pb-2 pr-4 font-medium">Tipo</th>
              <th class="pb-2 pr-4 font-medium">Descrição</th>
              <th class="pb-2 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in relatorio" :key="l.id" class="border-b border-glow-border-soft/60">
              <td class="py-2 pr-4 text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
              <td class="py-2 pr-4 text-glow-text">{{ l.tipo }}</td>
              <td class="py-2 pr-4 text-glow-text">{{ l.descricao }}</td>
              <td class="py-2 text-right font-medium text-glow-text">{{ formatCurrency(l.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
