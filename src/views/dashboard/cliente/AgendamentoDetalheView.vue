<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import AgendamentoDetailHeader from '@/components/agenda/detail/AgendamentoDetailHeader.vue'
import AgendamentoDetailField from '@/components/agenda/detail/AgendamentoDetailField.vue'
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import AgendamentoDetailServices from '@/components/agenda/detail/AgendamentoDetailServices.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { publicoService } from '@/services/publicoService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'
import type { AgendamentoCliente, SlotDisponivel } from '@/types/agendamento.types'
import {
  AGENDAMENTO_STATUS_CANCELAVEL,
  AGENDAMENTO_STATUS_REMARCAVEL,
} from '@/types/agendamento.types'
import {
  formatAgendaDetailSubtitle,
  formatAgendaTime,
  formatCurrency,
  formatEnderecoResumo,
  toAgendaTimeOnlyString,
  toDateOnlyFromIsoUtc,
  toDateOnlyString,
} from '@/utils/formatters'

const route = useRoute()
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
const remarcarMotivo = ref('')
const remarcarDate = ref(toDateOnlyString(new Date()))
const remarcarSlots = ref<SlotDisponivel[]>([])
const remarcarSlot = ref<SlotDisponivel | null>(null)
const remarcarLoading = ref(false)

const subtitle = computed(() =>
  agendamento.value?.inicio ? formatAgendaDetailSubtitle(agendamento.value.inicio) : undefined,
)

const serviceItens = computed(() =>
  (agendamento.value?.itens ?? []).map((item) => ({
    id: item.id,
    servicoNome: item.servicoNome,
    profissionalNome: item.profissionalNome,
    inicio: item.inicio,
    valor: item.valor,
  })),
)

const podeCancelar = computed(() =>
  agendamento.value ? AGENDAMENTO_STATUS_CANCELAVEL.includes(agendamento.value.status) : false,
)

const podeRemarcar = computed(() =>
  agendamento.value ? AGENDAMENTO_STATUS_REMARCAVEL.includes(agendamento.value.status) : false,
)

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

async function loadRemarcarSlots() {
  if (!agendamento.value) return
  remarcarLoading.value = true
  remarcarSlot.value = null
  try {
    const servicoIds = agendamento.value.itens.map((i) => i.servicoId)
    const data = await publicoService.consultarDisponibilidadeLoja(
      agendamento.value.estabelecimentoPublicGuid,
      {
        dataInicio: remarcarDate.value,
        dataFim: remarcarDate.value,
        servicoIds,
      },
    )
    remarcarSlots.value = data.slots
  } catch (err) {
    error.value = resolveError(err)
  } finally {
    remarcarLoading.value = false
  }
}

async function handleRemarcar() {
  if (!remarcarSlot.value || !remarcarMotivo.value.trim()) {
    error.value = 'Selecione um horário e informe o motivo.'
    return
  }
  actionLoading.value = true
  error.value = null
  try {
    const inicioSelecionado = remarcarSlot.value.inicio
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
  remarcarMotivo.value = ''
  remarcarDate.value = toDateOnlyString(new Date())
  void loadRemarcarSlots()
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

    <LoadingSpinner v-if="loading" />
    <BaseAlert v-else-if="error && !agendamento" variant="error">{{ error }}</BaseAlert>

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
            v-if="podeCancelar || podeRemarcar"
            class="agendamento-detail-actions"
          >
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

      <section v-if="remarcarOpen" class="agendamento-detail-remarcar-panel">
        <h2 class="agendamento-detail-remarcar-title">Remarcar agendamento</h2>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="space-y-4">
            <div>
              <label class="mb-2 block font-urbanist text-sm font-medium text-glow-text">
                Escolha uma nova data
              </label>
              <input
                v-model="remarcarDate"
                type="date"
                class="w-full max-w-[144px] rounded-xl border border-glow-border-soft bg-glow-surface px-4 py-2 font-urbanist text-sm"
                @change="loadRemarcarSlots"
              />
            </div>

            <div>
              <label class="mb-2 block font-urbanist text-sm font-medium text-glow-text">
                Escolha o novo horário
              </label>
              <LoadingSpinner v-if="remarcarLoading" />
              <div v-else class="agendamento-detail-slot-grid">
                <button
                  v-for="(slot, index) in remarcarSlots"
                  :key="`${slot.inicio}-${index}`"
                  type="button"
                  class="agendamento-detail-slot-btn"
                  :class="{ 'agendamento-detail-slot-btn--selected': remarcarSlot?.inicio === slot.inicio }"
                  @click="remarcarSlot = slot"
                >
                  {{ formatAgendaTime(slot.inicio) }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="font-urbanist text-sm font-medium text-glow-text">
              Motivo da remarcação
            </label>
            <textarea
              v-model="remarcarMotivo"
              rows="4"
              class="agendamento-detail-obs-box min-h-[82px] w-full"
              placeholder="Descreva o motivo da remarcação"
            />
          </div>
        </div>

        <div class="agendamento-detail-actions">
          <button
            type="button"
            class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-[132px]"
            @click="remarcarOpen = false"
          >
            Voltar
          </button>
          <button
            type="button"
            class="agendamento-detail-btn agendamento-detail-btn--confirm min-w-[214px]"
            :disabled="actionLoading"
            @click="handleRemarcar"
          >
            Confirmar remarcação
          </button>
        </div>
      </section>
    </template>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />
  </div>
</template>
