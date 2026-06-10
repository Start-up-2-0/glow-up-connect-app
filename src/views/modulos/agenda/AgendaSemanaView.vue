<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import type { AgendaGeral, AgendaProfissional } from '@/types/negocio/agenda.types'
import { agendaDetalhePath, ROUTE_PATHS } from '@/constants/routes'
import { formatAgendaDateTime } from '@/utils/formatters'

function weekRange(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const inicio = new Date(d.setDate(diff))
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + 6)
  fim.setHours(23, 59, 59, 999)
  return { inicio: inicio.toISOString(), fim: fim.toISOString() }
}

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agendaGeral = ref<AgendaGeral[]>([])
const agendaPropria = ref<AgendaProfissional[]>([])
const loading = ref(false)

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))

const itens = computed(() => {
  if (visaoGeral.value) {
    return agendaGeral.value.map((a) => ({
      agendamentoId: a.id,
      clienteNome: a.clienteNome,
      status: a.status,
      servicoNome: a.itens.map((i) => i.servicoNome).join(', '),
      inicio: a.inicio || a.itens[0]?.inicio || '',
    }))
  }
  return agendaPropria.value.map((a) => ({
    agendamentoId: a.agendamentoId,
    clienteNome: a.clienteNome,
    status: a.status,
    servicoNome: a.servicoNome,
    inicio: a.inicio,
  }))
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  const filtro = weekRange(new Date())
  try {
    if (visaoGeral.value) {
      agendaGeral.value = await agendaNegocioService.listarGeral(estabelecimentoId.value, filtro)
    } else {
      agendaPropria.value = await agendaNegocioService.listarPropria(estabelecimentoId.value, filtro)
    }
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
          Agenda da semana
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Visão semanal dos agendamentos.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink :to="ROUTE_PATHS.AGENDA">
          <BaseButton variant="secondary" size="sm">Hoje</BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.AGENDA_MES">
          <BaseButton variant="secondary" size="sm">Mês</BaseButton>
        </RouterLink>
      </div>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || (loading && itens.length === 0)" />

    <BaseCard v-else-if="itens.length === 0">
      <EmptyState title="Semana vazia" description="Nenhum agendamento nesta semana." />
    </BaseCard>

    <div v-else class="space-y-2">
      <RouterLink
        v-for="(item, idx) in itens"
        :key="`${item.agendamentoId}-${idx}`"
        :to="agendaDetalhePath(item.agendamentoId)"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft bg-glow-surface p-4 transition-colors hover:border-glow-gold-dark hover:bg-glow-hover-surface"
      >
        <div>
          <p class="font-urbanist text-sm font-semibold text-glow-text">{{ item.clienteNome }}</p>
          <p class="font-urbanist text-xs text-glow-text-subtle">
            {{ formatAgendaDateTime(item.inicio) }} · {{ item.servicoNome }}
          </p>
        </div>
        <AgendamentoStatusBadge :status="item.status" />
      </RouterLink>
    </div>
  </div>
</template>
