<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import CancelarAgendamentoModal from '@/components/cliente/CancelarAgendamentoModal.vue'
import AgendamentoDetailHeader from '@/components/agenda/detail/AgendamentoDetailHeader.vue'
import AgendamentoDetailField from '@/components/agenda/detail/AgendamentoDetailField.vue'
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import AgendamentoDetailServices from '@/components/agenda/detail/AgendamentoDetailServices.vue'
import AgendamentoDetailHistorico from '@/components/agenda/detail/AgendamentoDetailHistorico.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { agendaNegocioService } from '@/services/agendaNegocioService'
import { ROUTE_PATHS } from '@/constants/routes'
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
  formatCurrency,
  formatTelefone,
} from '@/utils/formatters'

const route = useRoute()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const agendamentoId = computed(() => Number(route.params.id))
const agendamento = ref<AgendaGeral | null>(null)
const historico = ref<AgendamentoHistorico[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const atendimentoItemLoadingId = ref<number | null>(null)
const cancelModalOpen = ref(false)
const sugerirModalOpen = ref(false)
const sugerirData = ref('')
const sugerirHorario = ref('')
const sugerirMotivo = ref('')

const visaoGeral = computed(() => possuiPermissao('AgendaVisualizarGeral'))
const podeIniciarAtendimento = computed(() => possuiPermissaoIniciarAtendimento(possuiPermissao))
const podeFinalizarAtendimento = computed(() => possuiPermissaoFinalizarAtendimento(possuiPermissao))
const podeGerenciarAgenda = computed(
  () => possuiPermissao('AgendaCancelar') || possuiPermissao('AgendaReagendar'),
)

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

async function handleIniciarAtendimento(itemId: number | string) {
  if (!estabelecimentoId.value || !agendamento.value) return
  const item = agendamento.value.itens.find((i) => i.id === Number(itemId))
  if (
    item &&
    !podeIniciarItemAtendimento(item.status, agendamento.value.status, item.inicio, item.fim)
  ) {
    notifications.push(
      'warning',
      motivoInicioIndisponivel(item.inicio) ?? 'Não é possível iniciar este atendimento agora.',
    )
    return
  }
  atendimentoItemLoadingId.value = Number(itemId)
  try {
    await agendaNegocioService.iniciarAtendimento(estabelecimentoId.value, Number(itemId))
    notifications.push('success', 'Atendimento iniciado.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    atendimentoItemLoadingId.value = null
  }
}

async function handleFinalizarAtendimento(itemId: number | string) {
  if (!estabelecimentoId.value) return
  atendimentoItemLoadingId.value = Number(itemId)
  try {
    await agendaNegocioService.finalizarAtendimento(estabelecimentoId.value, Number(itemId))
    notifications.push('success', 'Atendimento concluído.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    atendimentoItemLoadingId.value = null
  }
}

async function handleIniciarPrimeiroDisponivel() {
  if (itemParaIniciar.value) await handleIniciarAtendimento(itemParaIniciar.value.id)
}

async function handleConcluirPrimeiroDisponivel() {
  if (itemParaConcluir.value) await handleFinalizarAtendimento(itemParaConcluir.value.id)
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
      title="Detalhe do agendamento"
      :subtitle="subtitle"
      :back-to="ROUTE_PATHS.AGENDA"
    />

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="agendamento">
      <div class="agendamento-detail-grid">
        <div class="agendamento-detail-column">
          <AgendamentoDetailSection title="Resumo">
            <div class="agendamento-detail-panel__header">
              <span />
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
            </div>

            <AgendamentoDetailField label="Cliente">
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
            v-if="
              showConfirmar ||
              podeSugerirRemarcacao ||
              showCancelar ||
              showIniciarAtendimentoGeral ||
              showConcluirAtendimentoGeral
            "
            class="agendamento-detail-actions"
          >
            <button
              v-if="showConfirmar && podeGerenciarAgenda"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--confirm"
              :disabled="actionLoading"
              @click="handleConfirmar"
            >
              <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Confirmar
            </button>
            <button
              v-if="showIniciarAtendimentoGeral"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--confirm min-w-[185px]"
              :disabled="!!atendimentoItemLoadingId || !iniciarGeralHabilitado"
              :title="tituloIniciarGeral"
              @click="handleIniciarPrimeiroDisponivel"
            >
              Iniciar atendimento
            </button>
            <button
              v-if="showConcluirAtendimentoGeral"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-[185px]"
              :disabled="!!atendimentoItemLoadingId"
              @click="handleConcluirPrimeiroDisponivel"
            >
              Concluir atendimento
            </button>
            <button
              v-if="podeSugerirRemarcacao && podeGerenciarAgenda"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-[185px]"
              :disabled="actionLoading"
              @click="sugerirModalOpen = true"
            >
              Sugerir novo horário
            </button>
            <button
              v-if="showCancelar && podeGerenciarAgenda"
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
          <AgendamentoDetailServices
            :itens="serviceItens"
            :agendamento-status="agendamento.status"
            :pode-iniciar="podeIniciarAtendimento"
            :pode-finalizar="podeFinalizarAtendimento"
            :action-loading-id="atendimentoItemLoadingId"
            @iniciar="handleIniciarAtendimento"
            @finalizar="handleFinalizarAtendimento"
          />
          <AgendamentoDetailHistorico v-if="visaoGeral" :itens="historico" />
        </div>
      </div>
    </template>

    <BaseAlert v-else variant="error">Agendamento não encontrado.</BaseAlert>

    <CancelarAgendamentoModal v-model="cancelModalOpen" @confirm="handleCancelar" />

    <div
      v-if="sugerirModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="agendamento-detail-panel w-full max-w-md">
        <div class="agendamento-detail-panel__body space-y-4">
          <h3 class="font-satoshi text-lg font-bold text-glow-text">Sugerir novo horário</h3>
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Data</label>
            <input
              v-model="sugerirData"
              type="date"
              class="w-full rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Horário</label>
            <input
              v-model="sugerirHorario"
              type="time"
              class="w-full rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            />
          </div>
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Motivo</label>
            <textarea
              v-model="sugerirMotivo"
              rows="3"
              class="agendamento-detail-obs-box w-full"
            />
          </div>
          <div class="agendamento-detail-actions">
            <button
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-[132px]"
              @click="sugerirModalOpen = false"
            >
              Fechar
            </button>
            <button
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--confirm min-w-[132px]"
              :disabled="actionLoading"
              @click="handleSugerirRemarcacao"
            >
              Enviar sugestão
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
