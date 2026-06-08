<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AssinaturaStatusBadge from '@/components/assinatura/AssinaturaStatusBadge.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatBRL, formatDate } from '@/utils/formatters'

const { assinaturaId, estabelecimentoId } = useNegocioContext()
const assinaturaStore = useAssinaturaStore()
const { cobrancas, cobrancasLoading, assinatura } = storeToRefs(assinaturaStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

const proximaData = computed(() => assinatura.value?.proximaDataVencimento)

onMounted(async () => {
  if (!assinaturaId.value) return
  try {
    if (estabelecimentoId.value) {
      await assinaturaStore.fetchAtual(estabelecimentoId.value)
    }
    await assinaturaStore.fetchCobrancas(assinaturaId.value)
  } catch (err) {
    erro.value = resolveError(err)
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="flex items-center gap-4">
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_ASSINATURA"
        class="text-sm text-glow-gold hover:underline"
      >
        ← Assinatura
      </RouterLink>
      <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">Faturas</h1>
    </div>

    <LoadingSpinner v-if="cobrancasLoading" />
    <p v-else-if="erro" class="text-sm text-red-600">{{ erro }}</p>
    <EmptyState
      v-else-if="cobrancas.length === 0"
      title="Nenhuma fatura gerada ainda"
      :description="
        proximaData
          ? `Primeira cobrança em ${formatDate(proximaData)}.`
          : 'As faturas aparecerão aqui após o primeiro ciclo.'
      "
    />
    <BaseCard v-else :padding="false">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-glow-border-soft bg-glow-surface">
            <tr>
              <th class="px-4 py-3 font-medium text-glow-text">Ciclo</th>
              <th class="px-4 py-3 font-medium text-glow-text">Período</th>
              <th class="px-4 py-3 font-medium text-glow-text">Vencimento</th>
              <th class="px-4 py-3 font-medium text-glow-text">Valor</th>
              <th class="px-4 py-3 font-medium text-glow-text">Status</th>
              <th class="px-4 py-3 font-medium text-glow-text">Pago em</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cobranca in cobrancas"
              :key="cobranca.id"
              class="border-b border-glow-border-soft"
            >
              <td class="px-4 py-3 text-glow-text">{{ cobranca.numeroCiclo }}</td>
              <td class="px-4 py-3 text-glow-text-subtle">
                {{ formatDate(cobranca.cicloInicio) }} — {{ formatDate(cobranca.cicloFim) }}
              </td>
              <td class="px-4 py-3 text-glow-text-subtle">
                {{ formatDate(cobranca.dataVencimento) }}
              </td>
              <td class="px-4 py-3 text-glow-text">
                {{ formatBRL(cobranca.valor) }}
              </td>
              <td class="px-4 py-3">
                <AssinaturaStatusBadge :status="cobranca.status" />
              </td>
              <td class="px-4 py-3 text-glow-text-subtle">
                {{ cobranca.pagoEm ? formatDate(cobranca.pagoEm) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
