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
import type { ComissaoProfissional } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const comissoes = ref<ComissaoProfissional[]>([])
const loading = ref(false)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    comissoes.value = await caixaService.listarComissoes(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function formatComissao(c: ComissaoProfissional): string {
  if (c.percentual !== null) return `${c.percentual}%`
  if (c.valorFixo !== null) return formatCurrency(c.valorFixo)
  return '—'
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Comissões
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Regras de comissão dos profissionais.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.FINANCEIRO">
        <BaseButton variant="secondary" size="sm">Visão geral</BaseButton>
      </RouterLink>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || loading" />

    <BaseCard v-else-if="comissoes.length === 0">
      <EmptyState title="Nenhuma comissão" description="Configure comissões para os profissionais." />
    </BaseCard>

    <div v-else class="space-y-2">
      <div
        v-for="c in comissoes"
        :key="c.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div>
          <p class="font-urbanist text-sm font-semibold text-glow-text">{{ c.nomePublico }}</p>
          <p class="font-urbanist text-xs text-glow-text-subtle">
            {{ c.tipoComissao }} · {{ formatComissao(c) }}
          </p>
        </div>
        <span
          class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
          :class="c.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
        >
          {{ c.ativo ? 'Ativa' : 'Inativa' }}
        </span>
      </div>
    </div>
  </div>
</template>
