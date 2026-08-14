<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import AgendamentoDetailField from '@/components/agenda/detail/AgendamentoDetailField.vue'
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import AgendamentoDetailServices from '@/components/agenda/detail/AgendamentoDetailServices.vue'
import AgendamentoDetailHistorico from '@/components/agenda/detail/AgendamentoDetailHistorico.vue'
import RemarcarAgendamentoPanel from '@/components/agenda/detail/RemarcarAgendamentoPanel.vue'
import ReceberAgendamentoModal from '@/components/financeiro/ReceberAgendamentoModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useRemarcarAgendamentoSlots } from '@/composables/useRemarcarAgendamentoSlots'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { caixaService } from '@/services/caixaService'
import { ROUTE_PATHS } from '@/constants/routes'
import type { FormaRecebimentoPresencial } from '@/types/negocio/caixa.types'
import type {
  AgendaGeral,
  AgendaProfissional,
  AgendamentoHistorico,
} from '@/types/negocio/agenda.types'
import {
  motivoInicioIndisponivel,
  podeIniciarItemAtendimento,
  possuiPermissaoFinalizarAtendimento,
  possuiPermissaoIniciarAtendimento,
  statusPermiteFinalizarItemAtendimento,
  statusPermiteIniciarItemAtendimento,
} from '@/utils/agendamentoAtendimento'
import {
  formatAgendaDetailSubtitle,
  formatTelefone,
  toAgendaTimeOnlyString,
  toDateOnlyFromIsoUtc,
} from '@/utils/formatters'

const route = useRoute()
const { estabelecimentoId, estabelecimentoAtivo, ready, error: contextError } = useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agendamentoId = computed(() => Number(route.params.id))
const agendamento = ref<AgendaGeral | null>(null)
const historico = ref<AgendamentoHistorico[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const atendimentoLoading = ref(false)
const cancelModalOpen = ref(false)
const sugerirModalOpen = ref(false)
const receberModalOpen = ref(false)

const {
  date: sugerirDate,
  motivo: sugerirMotivo,
  slots: sugerirSlots,
  datasAtendimento: sugerirDatasAtendimento,
  selectedSlotInicio: sugerirSlotInicio,
  datasLoading: sugerirDatasLoading,
  slotsLoading: sugerirSlotsLoading,
  mensagemIndisponibilidade: sugerirMensagemIndisponibilidade,
  minSelectableDate: sugerirMinDate,
  maxSelectableDate: sugerirMaxDate,
  initialize: initializeSugerir,
  reset: resetSugerirForm,
  getSelectedSlot: getSugerirSlot,
} = useRemarcarAgendamentoSlots({
  getPublicGuid: () => estabelecimentoAtivo.value?.publicGuid,
  getServicoIds: () => agendamento.value?.itens.map((item) => item.servicoId) ?? [],
  getProfissionalId: () => agendamento.value?.itens[0]?.profissionalId,
  onError: (message) => {
    notifications.push('error', message)
  },
})

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))
const podeIniciarAtendimento = computed(() => possuiPermissaoIniciarAtendimento(possuiPermissao))
const podeFinalizarAtendimento = computed(() => possuiPermissaoFinalizarAtendimento(possuiPermissao))
const podeGerenciarAgenda = computed(
  () => possuiPermissao('AgendaCancelar') || possuiPermissao('AgendaReagendar'),
)
const podeReceberPresencial = computed(() => possuiPermissao('CaixaGerenciar'))

const statusElegiveisRecebimento = new Set([
  'PendentePagamento',
  'Confirmado',
  'PendenteConfirmacao',
  'Remarcado',
  'EmAtendimento',
  'Concluido',
])

const showReceber = computed(() => {
  const status = agendamento.value?.status
  return !!status && statusElegiveisRecebimento.has(status) && podeReceberPresencial.value
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

const podeSugerirRemarcacao = computed(() => {
  const status = agendamento.value?.status
  return status === 'PendenteConfirmacao' || status === 'Confirmado' || status === 'Remarcado'
})

const showConfirmar = computed(() => agendamento.value?.status === 'PendenteConfirmacao')

const showCancelar = computed(() => {
  const status = agendamento.value?.status
  return status === 'PendenteConfirmacao' || status === 'Confirmado' || status === 'Remarcado'
})

const itemParaIniciar = computed(() => {
  if (!agendamento.value) return null
  return (
    agendamento.value.itens.find((item) =>
      statusPermiteIniciarItemAtendimento(item.status, agendamento.value!.status),
    ) ?? null
  )
})

const itemParaConcluir = computed(() => {
  if (!agendamento.value) return null
  return (
    agendamento.value.itens.find((item) =>
      statusPermiteFinalizarItemAtendimento(item.status, agendamento.value!.status),
    ) ?? null
  )
})

const showIniciarAtendimentoGeral = computed(
  () => !!itemParaIniciar.value && podeIniciarAtendimento.value,
)

const showConcluirAtendimentoGeral = computed(
  () => !!itemParaConcluir.value && podeFinalizarAtendimento.value,
)

const showActionBar = computed(
  () =>
    !!(
      (showConfirmar.value && podeGerenciarAgenda.value) ||
      showReceber.value ||
      (podeSugerirRemarcacao.value && podeGerenciarAgenda.value) ||
      (showCancelar.value && podeGerenciarAgenda.value) ||
      showIniciarAtendimentoGeral.value ||
      showConcluirAtendimentoGeral.value
    ),
)

const iniciarGeralHabilitado = computed(() => {
  const item = itemParaIniciar.value
  if (!item || !agendamento.value) return false
  return podeIniciarItemAtendimento(
    item.status,
    agendamento.value.status,
    item.inicio,
    item.fim,
  )
})

const tituloIniciarGeral = computed(() => {
  const item = itemParaIniciar.value
  if (!item || iniciarGeralHabilitado.value) return undefined
  return motivoInicioIndisponivel(item.inicio) ?? undefined
})

function mapProfissionalParaAgendamento(itens: AgendaProfissional[]): AgendaGeral | null {
  const doAgendamento = itens.filter((item) => item.agendamentoId === agendamentoId.value)
  if (doAgendamento.length === 0) return null

  const primeiro = doAgendamento[0]!
  return {
    id: primeiro.agendamentoId,
    usuarioClienteId: primeiro.usuarioClienteId,
    clienteNome: primeiro.clienteNome,
    clienteEmail: primeiro.clienteEmail,
    clienteTelefone: primeiro.clienteTelefone,
    status: primeiro.agendamentoStatus || primeiro.status,
    valorTotal: 0,
    inicio: primeiro.inicio,
    fim: primeiro.fim,
    observacao: null,
    itens: doAgendamento.map((item) => ({
      id: item.agendamentoItemId,
      servicoId: item.servicoId,
      servicoNome: item.servicoNome,
      profissionalId: 0,
      profissionalNome: '',
      inicio: item.inicio,
      fim: item.fim,
      valor: 0,
      status: item.status,
    })),
  }
}

async function load() {
  if (!estabelecimentoId.value || !Number.isFinite(agendamentoId.value)) return
  loading.value = true
  try {
    if (visaoGeral.value) {
      const lista = await agendaNegocioService.listarGeral(estabelecimentoId.value, {
        pagina: 1,
        tamanhoPagina: 50,
        inicio: new Date(2020, 0, 1).toISOString(),
        fim: new Date(2035, 0, 1).toISOString(),
      })
      agendamento.value = lista.itens.find((a) => a.id === agendamentoId.value) ?? null
      historico.value = await agendaNegocioService.historico(
        estabelecimentoId.value,
        agendamentoId.value,
      )
    } else {
      const lista = await agendaNegocioService.listarPropria(estabelecimentoId.value, {
        pagina: 1,
        tamanhoPagina: 50,
        inicio: new Date(2020, 0, 1).toISOString(),
        fim: new Date(2035, 0, 1).toISOString(),
      })
      agendamento.value = mapProfissionalParaAgendamento(lista.itens)
      historico.value = []
    }
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

async function handleIniciarAgendamento() {
  if (!estabelecimentoId.value || !agendamento.value) return
  const itens = agendamento.value.itens.filter((item) =>
    podeIniciarItemAtendimento(item.status, agendamento.value!.status, item.inicio, item.fim),
  )
  if (itens.length === 0) {
    notifications.push(
      'warning',
      tituloIniciarGeral.value ?? 'Não é possível iniciar este atendimento agora.',
    )
    return
  }
  atendimentoLoading.value = true
  try {
    for (const item of itens) {
      await agendaNegocioService.iniciarAtendimento(estabelecimentoId.value, item.id)
    }
    notifications.push('success', 'Atendimento iniciado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
    await load()
  } finally {
    atendimentoLoading.value = false
  }
}

async function handleConcluirAgendamento() {
  if (!estabelecimentoId.value || !itemParaConcluir.value) return
  atendimentoLoading.value = true
  try {
    await agendaNegocioService.finalizarAtendimento(
      estabelecimentoId.value,
      itemParaConcluir.value.id,
    )
    notifications.push('success', 'Atendimento concluído.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    atendimentoLoading.value = false
  }
}

async function handleReceber(payload: {
  formaRecebimento: FormaRecebimentoPresencial
  valor?: number
}) {
  if (!estabelecimentoId.value || !agendamento.value) return
  actionLoading.value = true
  try {
    await caixaService.receberAgendamento(estabelecimentoId.value, agendamento.value.id, payload)
    notifications.push('success', 'Recebimento registrado no caixa.')
    receberModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function handleSugerirRemarcacao() {
  if (!estabelecimentoId.value || !agendamento.value) return
  const slot = getSugerirSlot()
  if (!slot || !sugerirMotivo.value.trim()) {
    notifications.push('warning', 'Selecione um horário e informe o motivo.')
    return
  }
  actionLoading.value = true
  try {
    await agendaNegocioService.sugerirRemarcacao(estabelecimentoId.value, agendamento.value.id, {
      data: toDateOnlyFromIsoUtc(slot.inicio),
      horarioInicio: toAgendaTimeOnlyString(slot.inicio),
      motivo: sugerirMotivo.value.trim(),
    })
    notifications.push('success', 'Sugestão enviada ao cliente.')
    sugerirModalOpen.value = false
    resetSugerirForm()
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function openSugerirRemarcacao() {
  sugerirModalOpen.value = true
  resetSugerirForm()
  void initializeSugerir()
}

function closeSugerirRemarcacao() {
  sugerirModalOpen.value = false
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
  [ready, agendamentoId, visaoGeral],
  () => {
    if (ready.value) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="agendamento-detail-page">
    <AgendamentoDetailHeader
      :title="agendamento?.clienteNome ?? 'Detalhe do agendamento'"
      :subtitle="subtitle"
      :back-to="ROUTE_PATHS.AGENDA"
    >
      <template v-if="agendamento" #meta>
        <div
          v-if="agendamento.status === 'PendenteConfirmacao'"
          class="agendamento-detail-pending-alert"
        >
          <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 4.5V8.5M8 11.5H8.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
          </svg>
          Aguardando confirmação
        </div>
        <AgendamentoStatusBadge v-else :status="agendamento.status" />
      </template>
    </AgendamentoDetailHeader>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="loading" class="flex justify-center py-16">
      <LoadingSpinner label="Carregando agendamento" />
    </div>

    <template v-else-if="agendamento">
      <div class="agendamento-detail-grid">
        <div class="agendamento-detail-column">
          <AgendamentoDetailSection title="Cliente">
            <div class="agendamento-detail-fields-grid">
              <AgendamentoDetailField label="Nome">
                <template #icon>
                  <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.2" />
                    <path d="M5 19c0-3 3.1-5 7-5s7 2 7 5" stroke="currentColor" stroke-width="1.2" />
                  </svg>
                </template>
                {{ agendamento.clienteNome }}
              </AgendamentoDetailField>

              <AgendamentoDetailField v-if="agendamento.clienteEmail" label="E-mail">
                <template #icon>
                  <svg class="size-4" viewBox="0 0 16 14" fill="none" aria-hidden="true">
                    <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                    <path d="M1 4L8 8.5L15 4" stroke="currentColor" stroke-width="1.2" />
                  </svg>
                </template>
                {{ agendamento.clienteEmail }}
              </AgendamentoDetailField>

              <AgendamentoDetailField v-if="agendamento.clienteTelefone" label="Telefone">
                <template #icon>
                  <svg class="size-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M5 3h2l1.5 4-2 1.5a9 9 0 0 0 4 4L12 10.5 16 12v2a2 2 0 0 1-2 2C7.6 16 2 10.4 2 3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.2" />
                  </svg>
                </template>
                {{ formatTelefone(agendamento.clienteTelefone) }}
              </AgendamentoDetailField>
            </div>

            <div v-if="agendamento.observacao" class="space-y-2">
              <div class="agendamento-detail-divider" />
              <p class="agendamento-detail-obs-label">Observação</p>
              <div class="agendamento-detail-obs-box">{{ agendamento.observacao }}</div>
            </div>

            <AgendamentoDetailServices embedded :itens="serviceItens" />
          </AgendamentoDetailSection>

          <div v-if="showActionBar" class="agendamento-detail-actions agendamento-detail-actions--toolbar">
            <div class="agendamento-detail-actions__secondary">
              <button
                v-if="showConfirmar && podeGerenciarAgenda"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--confirm"
                :disabled="actionLoading || atendimentoLoading"
                @click="handleConfirmar"
              >
                <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Confirmar
              </button>
              <button
                v-if="showReceber"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--secondary"
                :disabled="actionLoading || atendimentoLoading"
                @click="receberModalOpen = true"
              >
                Receber pagamento
              </button>
              <button
                v-if="podeSugerirRemarcacao && podeGerenciarAgenda"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--secondary"
                :disabled="actionLoading || atendimentoLoading"
                @click="openSugerirRemarcacao"
              >
                Sugerir novo horário
              </button>
              <button
                v-if="showCancelar && podeGerenciarAgenda"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--danger"
                :disabled="actionLoading || atendimentoLoading"
                @click="cancelModalOpen = true"
              >
                Cancelar
              </button>
            </div>

            <div class="agendamento-detail-actions__primary">
              <button
                v-if="showIniciarAtendimentoGeral"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--confirm"
                :disabled="actionLoading || atendimentoLoading || !iniciarGeralHabilitado"
                :title="tituloIniciarGeral"
                @click="handleIniciarAgendamento"
              >
                Iniciar atendimento
              </button>
              <button
                v-if="showConcluirAtendimentoGeral"
                type="button"
                class="agendamento-detail-btn agendamento-detail-btn--confirm"
                :disabled="actionLoading || atendimentoLoading"
                @click="handleConcluirAgendamento"
              >
                Concluir atendimento
              </button>
              <p
                v-if="showIniciarAtendimentoGeral && !iniciarGeralHabilitado && tituloIniciarGeral"
                class="agendamento-detail-action-hint"
              >
                {{ tituloIniciarGeral }}
              </p>
            </div>
          </div>
        </div>

        <AgendamentoDetailHistorico v-if="visaoGeral" :itens="historico" />
      </div>
    </template>

    <BaseAlert v-else-if="!loading" variant="error">Agendamento não encontrado.</BaseAlert>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />

    <RemarcarAgendamentoPanel
      v-if="sugerirModalOpen"
      v-model:date="sugerirDate"
      v-model:motivo="sugerirMotivo"
      v-model:selected-slot-inicio="sugerirSlotInicio"
      title="Sugerir novo horário"
      primary-label="Enviar sugestão"
      secondary-label="Voltar"
      :slots="sugerirSlots"
      :datas-atendimento="sugerirDatasAtendimento"
      :min-date="sugerirMinDate"
      :max-date="sugerirMaxDate"
      :datas-loading="sugerirDatasLoading"
      :slots-loading="sugerirSlotsLoading"
      :mensagem-indisponibilidade="sugerirMensagemIndisponibilidade"
      :confirm-loading="actionLoading"
      @confirm="handleSugerirRemarcacao"
      @cancel="closeSugerirRemarcacao"
    />

    <ReceberAgendamentoModal
      v-model="receberModalOpen"
      :valor-total="agendamento?.valorTotal ?? 0"
      :loading="actionLoading"
      @confirm="handleReceber"
    />
  </div>
</template>
