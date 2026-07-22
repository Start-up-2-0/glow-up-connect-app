<script setup lang="ts">
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import {
  formatAgendaTime,
  formatCurrency,
  initialsFromName,
} from '@/utils/formatters'
import {
  labelStatusItemAtendimento,
  motivoInicioIndisponivel,
  podeIniciarItemAtendimento,
  statusPermiteFinalizarItemAtendimento,
  statusPermiteIniciarItemAtendimento,
} from '@/utils/agendamentoAtendimento'

export interface AgendamentoDetailServiceItem {
  id: number | string
  servicoNome: string
  profissionalNome: string
  inicio: string
  fim: string
  valor: number
  status: string
}

const props = defineProps<{
  itens: AgendamentoDetailServiceItem[]
  agendamentoStatus: string
  podeIniciar?: boolean
  podeFinalizar?: boolean
  actionLoadingId?: number | string | null
}>()

const emit = defineEmits<{
  iniciar: [itemId: number | string]
  finalizar: [itemId: number | string]
}>()

function showIniciar(item: AgendamentoDetailServiceItem): boolean {
  return (
    !!props.podeIniciar &&
    statusPermiteIniciarItemAtendimento(item.status, props.agendamentoStatus)
  )
}

function showFinalizar(item: AgendamentoDetailServiceItem): boolean {
  return (
    !!props.podeFinalizar &&
    statusPermiteFinalizarItemAtendimento(item.status, props.agendamentoStatus)
  )
}

function iniciarHabilitado(item: AgendamentoDetailServiceItem): boolean {
  return podeIniciarItemAtendimento(
    item.status,
    props.agendamentoStatus,
    item.inicio,
    item.fim,
  )
}

function tituloIniciar(item: AgendamentoDetailServiceItem): string | undefined {
  if (iniciarHabilitado(item)) return undefined
  return motivoInicioIndisponivel(item.inicio) ?? undefined
}
</script>

<template>
  <AgendamentoDetailSection title="Serviço (s)">
    <div class="space-y-4">
      <article
        v-for="item in itens"
        :key="item.id"
        class="agendamento-detail-service-row"
      >
        <div class="agendamento-detail-service-avatar">
          {{ initialsFromName(item.profissionalNome) }}
        </div>
        <div class="agendamento-detail-service-main">
          <p class="agendamento-detail-service-name">{{ item.servicoNome }}</p>
          <p class="agendamento-detail-service-professional">
            feito por {{ item.profissionalNome }}
          </p>
          <p class="mt-1 font-urbanist text-xs font-medium text-glow-text-subtle">
            {{ labelStatusItemAtendimento(item.status) }}
          </p>
        </div>
        <div class="agendamento-detail-service-side">
          <p class="agendamento-detail-service-time">{{ formatAgendaTime(item.inicio) }}</p>
          <p class="agendamento-detail-service-price">{{ formatCurrency(item.valor) }}</p>
          <div
            v-if="showIniciar(item) || showFinalizar(item)"
            class="mt-2 flex flex-col gap-1"
          >
            <button
              v-if="showIniciar(item)"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--confirm min-w-0 px-2 text-xs"
              :disabled="actionLoadingId === item.id || !iniciarHabilitado(item)"
              :title="tituloIniciar(item)"
              @click="emit('iniciar', item.id)"
            >
              Iniciar
            </button>
            <button
              v-if="showFinalizar(item)"
              type="button"
              class="agendamento-detail-btn agendamento-detail-btn--secondary min-w-0 px-2 text-xs"
              :disabled="actionLoadingId === item.id"
              @click="emit('finalizar', item.id)"
            >
              Concluir
            </button>
          </div>
        </div>
      </article>
    </div>
  </AgendamentoDetailSection>
</template>
