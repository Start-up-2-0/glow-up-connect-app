<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import AgendamentoDetailHeader from '@/components/agenda/detail/AgendamentoDetailHeader.vue'
import AgendamentoDetailField from '@/components/agenda/detail/AgendamentoDetailField.vue'
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import AgendamentoDetailServices from '@/components/agenda/detail/AgendamentoDetailServices.vue'
import RemarcarAgendamentoPanel from '@/components/agenda/detail/RemarcarAgendamentoPanel.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { useRemarcarAgendamentoSlots } from '@/composables/useRemarcarAgendamentoSlots'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS, agendamentoAvaliarPath } from '@/constants/routes'
import { useRouter } from 'vue-router'
import type { AgendamentoCliente } from '@/types/agendamento.types'
import {
  AGENDAMENTO_STATUS_CANCELAVEL,
  AGENDAMENTO_STATUS_REMARCAVEL,
} from '@/types/agendamento.types'
import {
  formatAgendaDetailSubtitle,
  formatCurrency,
  formatEnderecoResumo,
  toAgendaTimeOnlyString,
  toDateOnlyFromIsoUtc,
} from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const store = useAgendamentosStore()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agendamentoId = computed(() => Number(route.params.id))
const agendamento = ref<AgendamentoCliente | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref(false)

const cancelModalOpen = ref(false)
const remarcarOpen = ref(false)

const {
  date: remarcarDate,
  motivo: remarcarMotivo,
  slots: remarcarSlots,
  datasAtendimento: remarcarDatasAtendimento,
  selectedSlotInicio: remarcarSlotInicio,
  datasLoading: remarcarDatasLoading,
  slotsLoading: remarcarSlotsLoading,
  mensagemIndisponibilidade: remarcarMensagemIndisponibilidade,
  minSelectableDate: remarcarMinDate,
  maxSelectableDate: remarcarMaxDate,
  initialize: initializeRemarcar,
  reset: resetRemarcarForm,
  getSelectedSlot,
} = useRemarcarAgendamentoSlots({
  getPublicGuid: () => agendamento.value?.estabelecimentoPublicGuid,
  getServicoIds: () => agendamento.value?.itens.map((item) => item.servicoId) ?? [],
  getProfissionalId: () => agendamento.value?.itens[0]?.profissionalId,
  onError: (message) => {
    error.value = message
  },
})

const subtitle = computed(() =>
  agendamento.value?.inicio ? formatAgendaDetailSubtitle(agendamento.value.inicio) : undefined,
)

const serviceItens = computed(() =>
  (agendamento.value?.itens ?? []).map((item) => ({
    id: item.id,
    servicoNome: item.servicoNome,
    profissionalNome: item.profissionalNome,
    inicio: item.inicio,
    fim: item.fim,
    valor: item.valor,
    status: item.status,
  })),
)

const podeCancelar = computed(() =>
  agendamento.value ? AGENDAMENTO_STATUS_CANCELAVEL.includes(agendamento.value.status) : false,
)

const podeRemarcar = computed(() =>
  agendamento.value ? AGENDAMENTO_STATUS_REMARCAVEL.includes(agendamento.value.status) : false,
)

const podeAvaliar = computed(() => agendamento.value?.avaliacaoStatus === 'Pendente')
const avaliacaoRealizada = computed(() => agendamento.value?.avaliacaoStatus === 'Realizada')

function irAvaliar() {
  if (!agendamento.value) return
  router.push(agendamentoAvaliarPath(agendamento.value.id))
}

async function load() {
  loading.value = true
  error.value = null
  try {
    agendamento.value = await store.fetchDetalhe(agendamentoId.value)
  } catch (err) {
    error.value = resolveError(err, 'Agendamento não encontrado.')
  } finally {
    loading.value = false
  }
}

async function handleCancelar(motivo: string) {
  actionLoading.value = true
  try {
    agendamento.value = await store.cancelar(agendamentoId.value, motivo)
    notifications.push('success', 'Agendamento cancelado.')
  } catch (err) {
    error.value = resolveError(err)
  } finally {
    actionLoading.value = false
  }
}

async function handleRemarcar() {
  const remarcarSlot = getSelectedSlot()
  if (!remarcarSlot || !remarcarMotivo.value.trim()) {
    error.value = 'Selecione um horário e informe o motivo.'
    return
  }
  actionLoading.value = true
  error.value = null
  try {
    const inicioSelecionado = remarcarSlot.inicio
    agendamento.value = await store.remarcar(agendamentoId.value, {
      data: toDateOnlyFromIsoUtc(inicioSelecionado),
      horarioInicio: toAgendaTimeOnlyString(inicioSelecionado),
      inicioSelecionado,
      motivo: remarcarMotivo.value.trim(),
    })
    remarcarOpen.value = false
    notifications.push('success', 'Agendamento remarcado.')
  } catch (err) {
    error.value = resolveError(err)
  } finally {
    actionLoading.value = false
  }
}

function openRemarcar() {
  remarcarOpen.value = true
  error.value = null
  resetRemarcarForm()
  void initializeRemarcar()
}

function closeRemarcar() {
  remarcarOpen.value = false
}

onMounted(load)
</script>

<template>
  <div class="agendamento-detail-page">
    <AgendamentoDetailHeader
      v-if="agendamento"
      :title="agendamento.estabelecimentoNome"
      :subtitle="subtitle"
      :back-to="ROUTE_PATHS.MEUS_AGENDAMENTOS"
    >
      <template #badge>
        <AgendamentoStatusBadge :status="agendamento.status" />
      </template>
    </AgendamentoDetailHeader>

    <AgendamentoDetailHeader
      v-else
      title="Detalhe do agendamento"
      :back-to="ROUTE_PATHS.MEUS_AGENDAMENTOS"
    />

    <BaseAlert v-if="!loading && error && !agendamento" variant="error">{{ error }}</BaseAlert>

    <template v-else-if="agendamento">
      <BaseAlert v-if="error" variant="error" class="mb-0">{{ error }}</BaseAlert>

      <div class="agendamento-detail-grid">
        <div class="agendamento-detail-column">
          <AgendamentoDetailSection title="Detalhes">
            <div class="agendamento-detail-panel__header">
              <span />
              <AgendamentoStatusBadge :status="agendamento.status" />
            </div>

            <AgendamentoDetailField label="Endereço">
              <template #icon>
                <svg class="size-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                  <path d="M6 8h6M6 11h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </template>
              {{ formatEnderecoResumo(agendamento.endereco) }}
            </AgendamentoDetailField>

            <AgendamentoDetailField label="Duração">
              <template #icon>
                <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
                  <path d="M8 4.5V8L10 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </template>
              {{ agendamento.duracaoTotalMinutos }} minutos
            </AgendamentoDetailField>

            <div class="agendamento-detail-divider" />

            <div class="agendamento-detail-total-row">
              <span class="agendamento-detail-total-label">Valor total</span>
              <span class="agendamento-detail-total-value">
                {{ formatCurrency(agendamento.valorTotal) }}
              </span>
            </div>

            <div v-if="agendamento.observacao" class="space-y-2">
              <p class="agendamento-detail-obs-label">Observação</p>
              <div class="agendamento-detail-obs-box">{{ agendamento.observacao }}</div>
            </div>
          </AgendamentoDetailSection>

          <div
            v-if="podeCancelar || podeRemarcar || podeAvaliar || avaliacaoRealizada"
            class="agendamento-detail-actions"
          >
            <button
              v-if="podeAvaliar"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--confirm min-w-[132px]"
              @click="irAvaliar"
            >
              Avaliar atendimento
            </button>
            <span
              v-else-if="avaliacaoRealizada && agendamento?.avaliacaoResumo"
              class="agendamento-detail-avaliado-badge"
            >
              Avaliado · Loja {{ agendamento.avaliacaoResumo.notaEstabelecimento }}/5 · Prof.
              {{ agendamento.avaliacaoResumo.notaProfissional }}/5
            </span>
            <button
              v-if="podeRemarcar"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-[132px]"
              :disabled="actionLoading"
              @click="openRemarcar"
            >
              Remarcar
            </button>
            <button
              v-if="podeCancelar"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--danger"
              :disabled="actionLoading"
              @click="cancelModalOpen = true"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div class="agendamento-detail-column">
          <AgendamentoDetailServices :itens="serviceItens" />
        </div>
      </div>

      <RemarcarAgendamentoPanel
        v-if="remarcarOpen"
        v-model:date="remarcarDate"
        v-model:motivo="remarcarMotivo"
        v-model:selected-slot-inicio="remarcarSlotInicio"
        title="Remarcar agendamento"
        :slots="remarcarSlots"
        :datas-atendimento="remarcarDatasAtendimento"
        :min-date="remarcarMinDate"
        :max-date="remarcarMaxDate"
        :datas-loading="remarcarDatasLoading"
        :slots-loading="remarcarSlotsLoading"
        :mensagem-indisponibilidade="remarcarMensagemIndisponibilidade"
        :confirm-loading="actionLoading"
        @confirm="handleRemarcar"
        @cancel="closeRemarcar"
      />
    </template>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />
  </div>
</template>
