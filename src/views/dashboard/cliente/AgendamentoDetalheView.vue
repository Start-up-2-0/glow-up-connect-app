<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { publicoService } from '@/services/publicoService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { AgendamentoCliente, SlotDisponivel } from '@/types/agendamento.types'
import {
  AGENDAMENTO_STATUS_CANCELAVEL,
  AGENDAMENTO_STATUS_REMARCAVEL,
} from '@/types/agendamento.types'
import {
  formatCurrency,
  formatAgendaDateTime,
  formatAgendaTime,
  formatEnderecoResumo,
  toDateOnlyString,
  toAgendaTimeOnlyString,
  toDateOnlyFromIsoUtc,
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
  loadRemarcarSlots()
}

onMounted(load)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <LoadingSpinner v-if="loading" />

    <template v-else-if="agendamento">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">
            {{ agendamento.estabelecimentoNome }}
          </h1>
          <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
            {{ formatAgendaDateTime(agendamento.inicio) }}
          </p>
        </div>
        <AgendamentoStatusBadge :status="agendamento.status" />
      </div>

      <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

      <BaseCard title="Detalhes">
        <dl class="space-y-3 font-urbanist text-sm">
          <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-32">Endereço</dt>
            <dd class="text-glow-text">{{ formatEnderecoResumo(agendamento.endereco) }}</dd>
          </div>
          <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-32">Valor</dt>
            <dd class="text-glow-text">{{ formatCurrency(agendamento.valorTotal) }}</dd>
          </div>
          <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-32">Duração</dt>
            <dd class="text-glow-text">{{ agendamento.duracaoTotalMinutos }} min</dd>
          </div>
          <div v-if="agendamento.observacao" class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-32">Observação</dt>
            <dd class="text-glow-text">{{ agendamento.observacao }}</dd>
          </div>
        </dl>
      </BaseCard>

      <BaseCard title="Serviços">
        <ul class="space-y-2">
          <li
            v-for="item in agendamento.itens"
            :key="item.id"
            class="flex flex-wrap justify-between gap-2 font-urbanist text-sm"
          >
            <span class="text-glow-text">{{ item.servicoNome }} · {{ item.profissionalNome }}</span>
            <span class="text-glow-text-subtle">{{ formatCurrency(item.valor) }}</span>
          </li>
        </ul>
      </BaseCard>

      <div v-if="podeCancelar || podeRemarcar" class="flex flex-wrap gap-2">
        <BaseButton
          v-if="podeRemarcar"
          variant="secondary"
          :loading="actionLoading"
          @click="openRemarcar"
        >
          Remarcar
        </BaseButton>
        <BaseButton
          v-if="podeCancelar"
          variant="danger"
          :loading="actionLoading"
          @click="cancelModalOpen = true"
        >
          Cancelar
        </BaseButton>
      </div>

      <BaseCard v-if="remarcarOpen" title="Remarcar agendamento">
        <div class="space-y-4">
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium">Nova data</label>
            <input
              v-model="remarcarDate"
              type="date"
              class="rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
              @change="loadRemarcarSlots"
            />
          </div>

          <LoadingSpinner v-if="remarcarLoading" />

          <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <button
              v-for="(slot, index) in remarcarSlots"
              :key="`${slot.inicio}-${index}`"
              type="button"
              class="rounded-lg border px-2 py-2 font-urbanist text-sm"
              :class="
                remarcarSlot?.inicio === slot.inicio
                  ? 'border-glow-gold-dark bg-glow-gold-selected'
                  : 'border-glow-border-soft'
              "
              @click="remarcarSlot = slot"
            >
              {{ formatAgendaTime(slot.inicio) }}
            </button>
          </div>

          <textarea
            v-model="remarcarMotivo"
            rows="2"
            placeholder="Motivo da remarcação"
            class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
          />

          <div class="flex gap-2">
            <BaseButton variant="secondary" @click="remarcarOpen = false">Cancelar</BaseButton>
            <BaseButton :loading="actionLoading" @click="handleRemarcar">Confirmar remarcação</BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>

    <BaseAlert v-else variant="error">{{ error ?? 'Agendamento não encontrado.' }}</BaseAlert>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />
  </div>
</template>
