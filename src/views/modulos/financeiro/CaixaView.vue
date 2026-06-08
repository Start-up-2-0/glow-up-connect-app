<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { CaixaResumo, LancamentoCaixa } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const resumo = ref<CaixaResumo | null>(null)
const lancamentos = ref<LancamentoCaixa[]>([])
const loading = ref(false)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const [r, l] = await Promise.all([
      caixaService.obterResumo(estabelecimentoId.value),
      caixaService.listarLancamentos(estabelecimentoId.value),
    ])
    resumo.value = r
    lancamentos.value = l
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
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Caixa
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Saldo e movimentações do caixa.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.FINANCEIRO">
        <BaseButton variant="secondary" size="sm">Visão geral</BaseButton>
      </RouterLink>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <div v-if="resumo" class="grid gap-4 sm:grid-cols-3">
        <BaseCard title="Saldo total">
          <p class="font-satoshi text-xl font-bold text-glow-text">
            {{ formatCurrency(resumo.saldoTotal) }}
          </p>
        </BaseCard>
        <BaseCard title="Disponível">
          <p class="font-satoshi text-xl font-bold text-green-700">
            {{ formatCurrency(resumo.saldoDisponivel) }}
          </p>
        </BaseCard>
        <BaseCard title="Retido">
          <p class="font-satoshi text-xl font-bold text-glow-text-subtle">
            {{ formatCurrency(resumo.saldoRetido) }}
          </p>
        </BaseCard>
      </div>

      <BaseCard title="Lançamentos">
        <EmptyState
          v-if="lancamentos.length === 0"
          title="Nenhum lançamento"
          description="As movimentações do caixa aparecerão aqui."
        />
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
              <tr
                v-for="l in lancamentos"
                :key="l.id"
                class="border-b border-glow-border-soft/60"
              >
                <td class="py-2 pr-4 text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
                <td class="py-2 pr-4 text-glow-text">{{ l.tipo }}</td>
                <td class="py-2 pr-4 text-glow-text">{{ l.descricao }}</td>
                <td class="py-2 text-right font-medium text-glow-text">
                  {{ formatCurrency(l.valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
