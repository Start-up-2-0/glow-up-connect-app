<script setup lang="ts">
import { ref, watch } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroStatusBadge from '@/components/financeiro/FinanceiroStatusBadge.vue'
import ConciliacaoImportModal from '@/components/financeiro/ConciliacaoImportModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { ConciliacaoItem } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDate } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const props = defineProps<{
  embedded?: boolean
}>()

const itens = ref<ConciliacaoItem[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const importModalOpen = ref(false)
const podeGerenciar = () => possuiPermissao('CaixaGerenciar')

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    itens.value = await caixaService.listarConciliacao(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function handleImportar(linhas: { data: string; descricao: string; valor: number }[]) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    itens.value = await caixaService.importarConciliacao(estabelecimentoId.value, linhas)
    notifications.push('success', 'Extrato importado.')
    importModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="embedded ? '' : FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      v-if="!embedded"
      title="Conciliação"
      subtitle="Importe extratos e concilie com lançamentos do caixa."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template v-if="podeGerenciar()" #actions>
        <button type="button" class="financeiro-btn-primary" @click="importModalOpen = true">
          Importar extrato
        </button>
      </template>
    </FinanceiroPageHeader>

    <div v-else-if="podeGerenciar()" class="mb-4 flex justify-end">
      <button type="button" class="financeiro-btn-primary" @click="importModalOpen = true">
        Importar extrato
      </button>
    </div>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <FinanceiroEmptyState
        v-if="itens.length === 0"
        title="Nenhum item de conciliação"
        description="Importe um extrato bancário para iniciar a conciliação."
      >
        <template v-if="podeGerenciar()" #action>
          <button type="button" class="financeiro-btn-primary" @click="importModalOpen = true">
            Importar extrato
          </button>
        </template>
      </FinanceiroEmptyState>

      <div v-else class="financeiro-table-wrap">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Data extrato</th>
              <th>Descrição</th>
              <th>Status</th>
              <th class="text-right">Valor</th>
              <th>Lançamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itens" :key="item.id">
              <td>{{ formatDate(item.dataExtrato) }}</td>
              <td>{{ item.descricaoExtrato }}</td>
              <td><FinanceiroStatusBadge :status="item.conciliado ? 'Conciliado' : 'Pendente'" /></td>
              <td class="text-right font-medium">{{ formatCurrency(item.valorExtrato) }}</td>
              <td>{{ item.lancamentoCaixaId ? `#${item.lancamentoCaixaId}` : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <ConciliacaoImportModal
      v-model="importModalOpen"
      :loading="actionLoading"
      @confirm="handleImportar"
    />
  </div>
</template>
