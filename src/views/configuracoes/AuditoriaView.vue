<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { auditoriaService } from '@/services/auditoriaService'
import type { AuditoriaRegistro } from '@/services/auditoriaService'
import { formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const registros = ref<AuditoriaRegistro[]>([])
const loading = ref(false)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    registros.value = await auditoriaService.listar(estabelecimentoId.value)
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
        Auditoria
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Trilha de operações registradas no estabelecimento.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard
      v-if="!contextError && !contextLoading && !loading && registros.length === 0"
    >
      <EmptyState
        title="Nenhum registro"
        description="As ações operacionais aparecerão aqui conforme forem realizadas."
      />
    </BaseCard>

    <div v-else-if="registros.length > 0" class="space-y-2">
      <div
        v-for="registro in registros"
        :key="registro.id"
        class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-urbanist text-sm font-semibold text-glow-text">{{ registro.tipoAcao }}</p>
          <span class="text-xs text-glow-text-subtle">{{ formatDateTime(registro.criadoEm) }}</span>
        </div>
        <p class="mt-1 text-xs text-glow-text-subtle">
          {{ registro.entidade }}
          <span v-if="registro.entidadeId">#{{ registro.entidadeId }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
