<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import { formatTelefone } from '@/utils/formatters'

interface ClienteResumo {
  id: number | null
  nome: string
  email: string | null
  telefone: string | null
  agendamentos: number
}

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agenda = ref<AgendaGeral[]>([])
const loading = ref(false)

const clientes = computed(() => {
  const map = new Map<string, ClienteResumo>()
  for (const a of agenda.value) {
    const key = a.usuarioClienteId !== null ? `u-${a.usuarioClienteId}` : `n-${a.clienteNome}`
    const existente = map.get(key)
    if (existente) {
      existente.agendamentos += 1
    } else {
      map.set(key, {
        id: a.usuarioClienteId,
        nome: a.clienteNome,
        email: a.clienteEmail,
        telefone: a.clienteTelefone,
        agendamentos: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const data = await agendaNegocioService.listarGeral(estabelecimentoId.value, {
      pagina: 1,
      tamanhoPagina: 50,
    })
    agenda.value = data.itens
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
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Clientes
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Clientes identificados a partir dos agendamentos.
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
        :key="`${c.id ?? 'anon'}-${idx}`"
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
      </div>
    </div>
  </div>
</template>
