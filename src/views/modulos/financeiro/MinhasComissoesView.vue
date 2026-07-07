<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { ComissaoExtrato } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const extrato = ref<ComissaoExtrato[]>([])
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
    extrato.value = await caixaService.listarMinhasComissoes(estabelecimentoId.value, filtro)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Minhas comissões</h1>
    <FinanceiroPeriodoFiltro v-model:inicio="filtroInicio" v-model:fim="filtroFim" @aplicar="load" />
    <LoadingSpinner v-if="contextLoading || loading" />
    <BaseCard v-else>
      <EmptyState v-if="extrato.length === 0" title="Sem comissões" description="Nenhum lançamento no período." />
      <div v-else class="space-y-2">
        <div
          v-for="item in extrato"
          :key="item.lancamentoId"
          class="flex items-center justify-between rounded border border-glow-border-soft px-4 py-3"
        >
          <div>
            <p class="font-urbanist text-sm text-glow-text">{{ item.descricao }}</p>
            <p class="text-xs text-glow-text-subtle">{{ formatDateTime(item.criadoEm) }}</p>
          </div>
          <span class="font-semibold text-glow-text">{{ formatCurrency(item.valor) }}</span>
        </div>
      </div>
    </BaseCard>
    <p v-if="contextError" class="text-sm text-red-600">{{ contextError }}</p>
  </div>
</template>
