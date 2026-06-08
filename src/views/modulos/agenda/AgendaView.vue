<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import NotificacoesIndicador from '@/components/negocio/NotificacoesIndicador.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import type { AgendaGeral, AgendaProfissional } from '@/types/negocio/agenda.types'
import {
  agendaDetalhePath,
  ROUTE_PATHS,
} from '@/constants/routes'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

function dayRange(date: Date) {
  const inicio = new Date(date)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(date)
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
const actionId = ref<number | null>(null)
const cancelModalOpen = ref(false)
const cancelTargetId = ref<number | null>(null)

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))

const itensHoje = computed(() => {
  if (visaoGeral.value) {
    return agendaGeral.value.map((a) => ({
      id: a.id,
      clienteNome: a.clienteNome,
      status: a.status,
      valorTotal: a.valorTotal,
      inicio: a.itens[0]?.inicio ?? '',
      label: a.itens.map((i) => i.servicoNome).join(', '),
    }))
  }
  return agendaPropria.value.map((a) => ({
    id: a.agendamentoId,
    clienteNome: a.clienteNome,
    status: a.status,
    valorTotal: 0,
    inicio: a.inicio,
    label: a.servicoNome,
  }))
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  const filtro = dayRange(new Date())
  try {
    if (visaoGeral.value) {
      agendaGeral.value = await agendaNegocioService.listarGeral(estabelecimentoId.value, filtro)
    } else {
      agendaPropria.value = await agendaNegocioService.listarPropria(estabelecimentoId.value, filtro)
    }
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar a agenda.'))
  } finally {
    loading.value = false
  }
}

async function handleConfirmar(id: number) {
  if (!estabelecimentoId.value) return
  actionId.value = id
  try {
    await agendaNegocioService.confirmar(estabelecimentoId.value, id)
    notifications.push('success', 'Agendamento confirmado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionId.value = null
  }
}

function abrirCancelar(id: number) {
  cancelTargetId.value = id
  cancelModalOpen.value = true
}

async function handleCancelar(motivo: string) {
  if (!estabelecimentoId.value || cancelTargetId.value === null) return
  actionId.value = cancelTargetId.value
  try {
    await agendaNegocioService.cancelar(estabelecimentoId.value, cancelTargetId.value, motivo)
    notifications.push('success', 'Agendamento cancelado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionId.value = null
    cancelTargetId.value = null
  }
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Agenda de hoje
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Agendamentos do dia atual.
        </p>
        <NotificacoesIndicador class="mt-2" />
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink :to="ROUTE_PATHS.AGENDA_SEMANA">
          <BaseButton variant="secondary" size="sm">Semana</BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.AGENDA_MES">
          <BaseButton variant="secondary" size="sm">Mês</BaseButton>
        </RouterLink>
      </div>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || (loading && itensHoje.length === 0)" />

    <BaseCard v-else-if="itensHoje.length === 0">
      <EmptyState
        title="Nenhum agendamento hoje"
        description="Não há horários marcados para o dia de hoje."
      />
    </BaseCard>

    <div v-else class="space-y-3">
      <div
        v-for="item in itensHoje"
        :key="item.id"
        class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <RouterLink
              :to="agendaDetalhePath(item.id)"
              class="font-urbanist text-base font-semibold text-glow-text hover:text-glow-gold-dark"
            >
              {{ item.clienteNome }}
            </RouterLink>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              {{ item.inicio ? formatDateTime(item.inicio) : '—' }}
            </p>
            <p class="mt-1 font-urbanist text-sm text-glow-text">{{ item.label }}</p>
            <p v-if="item.valorTotal > 0" class="mt-1 font-urbanist text-sm font-medium text-glow-text">
              {{ formatCurrency(item.valorTotal) }}
            </p>
          </div>
          <AgendamentoStatusBadge :status="item.status" />
        </div>
        <div
          v-if="item.status === 'PendenteConfirmacao'"
          class="mt-3 flex flex-wrap gap-2"
        >
          <BaseButton
            size="sm"
            :loading="actionId === item.id"
            @click="handleConfirmar(item.id)"
          >
            Confirmar
          </BaseButton>
          <BaseButton
            variant="danger"
            size="sm"
            :loading="actionId === item.id"
            @click="abrirCancelar(item.id)"
          >
            Cancelar
          </BaseButton>
        </div>
      </div>
    </div>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />
  </div>
</template>
