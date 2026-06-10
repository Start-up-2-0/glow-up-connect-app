<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import type { AgendaGeral, AgendamentoHistorico } from '@/types/negocio/agenda.types'
import {
  formatAgendaDateTime,
  formatCurrency,
  formatDateTime,
  formatTelefone,
  agendamentoStatusLabel,
} from '@/utils/formatters'

const route = useRoute()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agendamentoId = computed(() => Number(route.params.id))
const agendamento = ref<AgendaGeral | null>(null)
const historico = ref<AgendamentoHistorico[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const cancelModalOpen = ref(false)
const sugerirModalOpen = ref(false)
const sugerirData = ref('')
const sugerirHorario = ref('')
const sugerirMotivo = ref('')

const podeSugerirRemarcacao = computed(() => {
  const status = agendamento.value?.status
  return status === 'PendenteConfirmacao' || status === 'Confirmado' || status === 'Remarcado'
})

async function load() {
  if (!estabelecimentoId.value || !Number.isFinite(agendamentoId.value)) return
  loading.value = true
  try {
    const lista = await agendaNegocioService.listarGeral(estabelecimentoId.value)
    agendamento.value = lista.find((a) => a.id === agendamentoId.value) ?? null
    historico.value = await agendaNegocioService.historico(
      estabelecimentoId.value,
      agendamentoId.value,
    )
  } catch (err) {
    notifications.push('error', resolveError(err, 'Agendamento não encontrado.'))
  } finally {
    loading.value = false
  }
}

async function handleConfirmar() {
  if (!estabelecimentoId.value || !agendamento.value) return
  actionLoading.value = true
  try {
    await agendaNegocioService.confirmar(estabelecimentoId.value, agendamento.value.id)
    notifications.push('success', 'Agendamento confirmado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function handleSugerirRemarcacao() {
  if (!estabelecimentoId.value || !agendamento.value) return
  if (!sugerirData.value || !sugerirHorario.value || !sugerirMotivo.value.trim()) {
    notifications.push('warning', 'Informe data, horário e motivo.')
    return
  }
  actionLoading.value = true
  try {
    await agendaNegocioService.sugerirRemarcacao(estabelecimentoId.value, agendamento.value.id, {
      data: sugerirData.value,
      horarioInicio: sugerirHorario.value,
      motivo: sugerirMotivo.value.trim(),
    })
    notifications.push('success', 'Sugestão enviada ao cliente.')
    sugerirModalOpen.value = false
    sugerirData.value = ''
    sugerirHorario.value = ''
    sugerirMotivo.value = ''
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function handleCancelar(motivo: string) {
  if (!estabelecimentoId.value || !agendamento.value) return
  actionLoading.value = true
  try {
    await agendaNegocioService.cancelar(estabelecimentoId.value, agendamento.value.id, motivo)
    notifications.push('success', 'Agendamento cancelado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(
  [ready, agendamentoId],
  () => {
    if (ready.value) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Detalhe do agendamento
      </h1>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="agendamento">
      <BaseCard title="Resumo">
        <div class="space-y-3 font-urbanist text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-glow-text">{{ agendamento.clienteNome }}</span>
            <AgendamentoStatusBadge :status="agendamento.status" />
          </div>
          <p v-if="agendamento.clienteEmail" class="text-glow-text-subtle">
            {{ agendamento.clienteEmail }}
          </p>
          <p v-if="agendamento.clienteTelefone" class="text-glow-text-subtle">
            {{ formatTelefone(agendamento.clienteTelefone) }}
          </p>
          <p class="font-medium text-glow-text">
            Total: {{ formatCurrency(agendamento.valorTotal) }}
          </p>
          <p v-if="agendamento.observacao" class="text-glow-text-subtle">
            {{ agendamento.observacao }}
          </p>
        </div>

        <div class="mt-4 space-y-2 border-t border-glow-border-soft pt-4">
          <p
            v-for="item in agendamento.itens"
            :key="item.id"
            class="font-urbanist text-sm text-glow-text"
          >
            {{ item.servicoNome }} · {{ item.profissionalNome }} ·
            {{ formatAgendaDateTime(item.inicio) }}
          </p>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <BaseButton
            v-if="agendamento.status === 'PendenteConfirmacao'"
            :loading="actionLoading"
            @click="handleConfirmar"
          >
            Confirmar
          </BaseButton>
          <BaseButton
            v-if="podeSugerirRemarcacao"
            variant="secondary"
            :loading="actionLoading"
            @click="sugerirModalOpen = true"
          >
            Sugerir novo horário
          </BaseButton>
          <BaseButton
            v-if="agendamento.status === 'PendenteConfirmacao' || agendamento.status === 'Confirmado' || agendamento.status === 'Remarcado'"
            variant="danger"
            :loading="actionLoading"
            @click="cancelModalOpen = true"
          >
            Cancelar
          </BaseButton>
        </div>
      </BaseCard>

      <BaseCard title="Histórico">
        <div v-if="historico.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
          Nenhum registro no histórico.
        </div>
        <ol v-else class="space-y-3">
          <li
            v-for="h in historico"
            :key="h.id"
            class="border-l-2 border-glow-border-soft pl-4 font-urbanist text-sm"
          >
            <p class="font-medium text-glow-text">
              {{ agendamentoStatusLabel(h.statusAnterior) }} →
              {{ agendamentoStatusLabel(h.statusNovo) }}
            </p>
            <p class="text-xs text-glow-text-subtle">{{ formatDateTime(h.criadoEm) }}</p>
            <p v-if="h.usuarioExecutorNome" class="text-xs text-glow-text-subtle">
              por {{ h.usuarioExecutorNome }}
            </p>
            <p v-if="h.motivo" class="text-xs text-glow-text-subtle">{{ h.motivo }}</p>
          </li>
        </ol>
      </BaseCard>
    </template>

    <BaseAlert v-else variant="error">Agendamento não encontrado.</BaseAlert>
    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />

    <div
      v-if="sugerirModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <BaseCard title="Sugerir novo horário" class="w-full max-w-md">
        <div class="space-y-3">
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Data</label>
            <input
              v-model="sugerirData"
              type="date"
              class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Horário</label>
            <input
              v-model="sugerirHorario"
              type="time"
              class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Motivo</label>
            <textarea
              v-model="sugerirMotivo"
              rows="2"
              class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <BaseButton variant="secondary" @click="sugerirModalOpen = false">Fechar</BaseButton>
          <BaseButton :loading="actionLoading" @click="handleSugerirRemarcacao">Enviar sugestão</BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
