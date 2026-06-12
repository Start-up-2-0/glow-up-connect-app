<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendaPageHeader from '@/components/agenda/AgendaPageHeader.vue'
import AgendaFilterDropdown from '@/components/agenda/AgendaFilterDropdown.vue'
import AgendamentoCard from '@/components/agenda/AgendamentoCard.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAgendaPageFilters } from '@/composables/useAgendaPageFilters'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import type { AgendaGeral, AgendaProfissional } from '@/types/negocio/agenda.types'
import { agendaDetalhePath } from '@/constants/routes'
import { formatDateShortNumeric } from '@/utils/formatters'
import {
  podeFinalizarItemAtendimento,
  podeIniciarItemAtendimento,
  possuiPermissaoFinalizarAtendimento,
  possuiPermissaoIniciarAtendimento,
  statusPermiteFinalizarItemAtendimento,
  statusPermiteIniciarItemAtendimento,
} from '@/utils/agendamentoAtendimento'

const route = useRoute()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const {
  statusFilter,
  periodFilter,
  statusOptions,
  periodOptions,
  dateRange,
  matchesStatus,
} = useAgendaPageFilters('hoje')

const periodoFromQuery = route.query.periodo
if (periodoFromQuery === 'semana' || periodoFromQuery === 'mes') {
  periodFilter.value = periodoFromQuery
}

const agendaGeral = ref<AgendaGeral[]>([])
const agendaPropria = ref<AgendaProfissional[]>([])
const loading = ref(false)
const actionId = ref<number | null>(null)
const cancelModalOpen = ref(false)
const cancelTargetId = ref<number | null>(null)

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))
const podeConfirmarOuCancelar = computed(
  () => possuiPermissao('AgendaCancelar') || possuiPermissao('AgendaReagendar'),
)
const podeIniciarAtendimento = computed(() => possuiPermissaoIniciarAtendimento(possuiPermissao))
const podeFinalizarAtendimento = computed(() => possuiPermissaoFinalizarAtendimento(possuiPermissao))

const pageTitle = computed(() => {
  if (periodFilter.value === 'semana') return visaoGeral.value ? 'Agenda da semana' : 'Meus agendamentos da semana'
  if (periodFilter.value === 'mes') return visaoGeral.value ? 'Agenda do mês' : 'Meus agendamentos do mês'
  return visaoGeral.value ? 'Agenda de hoje' : 'Meus agendamentos de hoje'
})

const pageSubtitle = computed(() => {
  if (periodFilter.value === 'semana') return 'Visão semanal dos agendamentos.'
  if (periodFilter.value === 'mes') return 'Visão mensal dos agendamentos.'
  return visaoGeral.value
    ? 'Agendamentos do dia atual.'
    : 'Horários marcados com você nesta loja.'
})

const showDateInTitle = computed(() => periodFilter.value === 'hoje')
const dateLabel = computed(() => (showDateInTitle.value ? formatDateShortNumeric() : undefined))

function itemComAcaoAtendimento(itens: AgendaGeral['itens'], agendamentoStatus: string) {
  return itens.find(
    (item) =>
      statusPermiteIniciarItemAtendimento(item.status, agendamentoStatus) ||
      statusPermiteFinalizarItemAtendimento(item.status, agendamentoStatus),
  )
}

const itens = computed(() => {
  const mapped = visaoGeral.value
    ? agendaGeral.value.map((a) => {
        const itemAcao = itemComAcaoAtendimento(a.itens, a.status) ?? a.itens[0]
        return {
        id: a.id,
        agendamentoItemId: itemAcao?.id ?? null,
        clienteNome: a.clienteNome,
        status: a.status,
        agendamentoStatus: a.status,
        itemStatus: itemAcao?.status ?? a.status,
        valorTotal: a.valorTotal,
        inicio: a.inicio || itemAcao?.inicio || '',
        fim: a.fim || itemAcao?.fim || '',
        label: a.itens.map((i) => i.servicoNome).join(', '),
      }})
    : agendaPropria.value.map((a) => ({
        id: a.agendamentoId,
        agendamentoItemId: a.agendamentoItemId,
        clienteNome: a.clienteNome,
        status: a.agendamentoStatus || a.status,
        agendamentoStatus: a.agendamentoStatus || a.status,
        itemStatus: a.status,
        valorTotal: 0,
        inicio: a.inicio,
        fim: a.fim,
        label: a.servicoNome,
      }))

  return mapped.filter((item) => matchesStatus(item.status))
})

function statusPermiteIniciarCard(item: (typeof itens.value)[number]): boolean {
  if (!item.agendamentoItemId) return false
  return statusPermiteIniciarItemAtendimento(item.itemStatus, item.agendamentoStatus)
}

function statusPermiteFinalizarCard(item: (typeof itens.value)[number]): boolean {
  if (!item.agendamentoItemId) return false
  return statusPermiteFinalizarItemAtendimento(item.itemStatus, item.agendamentoStatus)
}

function podeIniciarCard(item: (typeof itens.value)[number]): boolean {
  if (!item.agendamentoItemId) return false
  return podeIniciarItemAtendimento(
    item.itemStatus,
    item.agendamentoStatus,
    item.inicio,
    item.fim,
  )
}

function podeFinalizarCard(item: (typeof itens.value)[number]): boolean {
  if (!item.agendamentoItemId) return false
  return podeFinalizarItemAtendimento(item.itemStatus, item.agendamentoStatus)
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  const filtro = {
    inicio: dateRange.value.inicio,
    fim: dateRange.value.fim,
    ...(statusFilter.value ? { status: statusFilter.value } : {}),
  }
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

async function handleIniciarAtendimento(itemId: number) {
  if (!estabelecimentoId.value) return
  actionId.value = itemId
  try {
    await agendaNegocioService.iniciarAtendimento(estabelecimentoId.value, itemId)
    notifications.push('success', 'Atendimento iniciado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionId.value = null
  }
}

async function handleFinalizarAtendimento(itemId: number) {
  if (!estabelecimentoId.value) return
  actionId.value = itemId
  try {
    await agendaNegocioService.finalizarAtendimento(estabelecimentoId.value, itemId)
    notifications.push('success', 'Atendimento concluído.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionId.value = null
  }
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

watch([statusFilter, periodFilter], () => {
  if (ready.value) void load()
})
</script>

<template>
  <div class="agenda-page">
    <AgendaPageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :date-label="dateLabel"
    >
      <template #filters>
        <AgendaFilterDropdown
          v-model="statusFilter"
          button-label="Filtrar por Status"
          :options="statusOptions"
        >
          <template #icon>
            <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M10 5.5V10l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </template>
        </AgendaFilterDropdown>

        <AgendaFilterDropdown
          v-model="periodFilter"
          button-label="Filtrar por Período"
          :options="periodOptions"
        >
          <template #icon>
            <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M5 1.5V4M11 1.5V4M1.5 6.5H14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </template>
        </AgendaFilterDropdown>
      </template>
    </AgendaPageHeader>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || (loading && itens.length === 0)" />

    <EmptyState
      v-else-if="itens.length === 0"
      title="Nenhum agendamento"
      description="Não há horários para o período e filtros selecionados."
    />

    <div v-else class="agenda-cards-grid">
      <AgendamentoCard
        v-for="item in itens"
        :key="`${item.id}-${item.agendamentoItemId ?? 0}`"
        :title="item.clienteNome"
        :subtitle="item.label"
        :inicio="item.inicio"
        :valor-total="item.valorTotal"
        :status="item.status"
        tall
        :to="
          (item.status === 'PendenteConfirmacao' && podeConfirmarOuCancelar) ||
          (podeIniciarAtendimento && statusPermiteIniciarCard(item)) ||
          (podeFinalizarAtendimento && statusPermiteFinalizarCard(item))
            ? undefined
            : agendaDetalhePath(item.id)
        "
        :show-actions="item.status === 'PendenteConfirmacao' && podeConfirmarOuCancelar"
        :show-atendimento-actions="
          (podeIniciarAtendimento && statusPermiteIniciarCard(item)) ||
          (podeFinalizarAtendimento && statusPermiteFinalizarCard(item))
        "
        :pode-iniciar-atendimento="podeIniciarAtendimento && statusPermiteIniciarCard(item)"
        :pode-finalizar-atendimento="podeFinalizarAtendimento && statusPermiteFinalizarCard(item)"
        :iniciar-atendimento-habilitado="podeIniciarCard(item)"
        :finalizar-atendimento-habilitado="podeFinalizarCard(item)"
        :action-loading="actionId === item.id || actionId === item.agendamentoItemId"
        @confirm="handleConfirmar(item.id)"
        @cancel="abrirCancelar(item.id)"
        @iniciar-atendimento="
          item.agendamentoItemId && handleIniciarAtendimento(item.agendamentoItemId)
        "
        @finalizar-atendimento="
          item.agendamentoItemId && handleFinalizarAtendimento(item.agendamentoItemId)
        "
      />
    </div>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />
  </div>
</template>
