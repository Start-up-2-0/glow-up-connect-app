<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { clienteNegocioService } from '@/services/clienteNegocioService'
import { formatTelefone, formatDateTime } from '@/utils/formatters'

interface ClienteItem {
  nome: string
  email: string | null
  telefone: string | null
  agendamentos: number
  ultimoAgendamentoEm: string | null
}

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiModulo } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const clientes = ref<ClienteItem[]>([])
const loading = ref(false)

const usaApiPremium = computed(() => possuiModulo('Clientes'))

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (usaApiPremium.value) {
      const data = await clienteNegocioService.listar(estabelecimentoId.value)
      clientes.value = data.map((c) => ({
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        agendamentos: c.totalAgendamentos,
        ultimoAgendamentoEm: c.ultimoAgendamentoEm,
      }))
    }
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
        Clientes
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        CRM com histórico consolidado de agendamentos (Premium).
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || (loading && clientes.length === 0)" />

    <BaseCard v-else-if="clientes.length === 0">
      <EmptyState
        title="Nenhum cliente"
        description="Os clientes aparecerão aqui conforme os agendamentos forem registrados."
      />
    </BaseCard>

    <div v-else class="space-y-2">
      <div
        v-for="(c, idx) in clientes"
        :key="`${c.nome}-${idx}`"
        class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-urbanist text-sm font-semibold text-glow-text">{{ c.nome }}</p>
          <span class="font-urbanist text-xs text-glow-text-subtle">
            {{ c.agendamentos }} agendamento{{ c.agendamentos !== 1 ? 's' : '' }}
          </span>
        </div>
        <p v-if="c.email" class="mt-1 font-urbanist text-xs text-glow-text-subtle">{{ c.email }}</p>
        <p v-if="c.telefone" class="font-urbanist text-xs text-glow-text-subtle">
          {{ formatTelefone(c.telefone) }}
        </p>
        <p v-if="c.ultimoAgendamentoEm" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
          Último agendamento: {{ formatDateTime(c.ultimoAgendamentoEm) }}
        </p>
      </div>
    </div>
  </div>
</template>
