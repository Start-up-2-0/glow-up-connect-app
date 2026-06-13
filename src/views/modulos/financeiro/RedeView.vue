<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { redeService } from '@/services/redeService'
import type { RedeResumo } from '@/services/redeService'

const { ready, error: contextError, loading: contextLoading } = useEstabelecimentoView()
const { assinaturaId } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const resumo = ref<RedeResumo | null>(null)
const loading = ref(false)

const podeExibir = computed(() => Boolean(assinaturaId.value))

async function load() {
  if (!assinaturaId.value) return
  loading.value = true
  try {
    resumo.value = await redeService.obterResumo(assinaturaId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Painel da rede
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Visão consolidada das unidades vinculadas ao seu plano Premium.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <EmptyState
      v-else-if="!podeExibir"
      title="Assinatura não encontrada"
      description="Selecione a unidade matriz com assinatura Premium ativa."
    />
    <LoadingSpinner v-else-if="contextLoading || (loading && !resumo)" />

    <template v-else-if="resumo">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseCard title="Unidades">
          <p class="font-satoshi text-2xl font-bold text-glow-text">
            {{ resumo.totalUnidades }}
            <span v-if="resumo.limiteUnidades" class="text-base font-medium text-glow-text-subtle">
              / {{ resumo.limiteUnidades }}
            </span>
          </p>
        </BaseCard>
        <BaseCard title="Agendamentos (30 dias)">
          <p class="font-satoshi text-2xl font-bold text-glow-text">
            {{ resumo.totalAgendamentosNoPeriodo }}
          </p>
        </BaseCard>
      </div>

      <BaseCard title="Unidades">
        <div v-if="resumo.unidades.length === 0">
          <EmptyState
            title="Nenhuma unidade"
            description="Adicione unidades na página de assinatura."
          />
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="unidade in resumo.unidades"
            :key="unidade.estabelecimentoId"
            class="flex items-center justify-between rounded-lg border border-glow-border-soft px-4 py-3"
          >
            <div>
              <p class="font-urbanist text-sm font-semibold text-glow-text">{{ unidade.nome }}</p>
              <p v-if="unidade.ehMatriz" class="text-xs text-glow-gold">Matriz</p>
            </div>
            <span class="text-sm text-glow-text-subtle">
              {{ unidade.agendamentosNoPeriodo }} agendamentos
            </span>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
