<script setup lang="ts">
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import AgendamentoDetailField from '@/components/agenda/detail/AgendamentoDetailField.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import { formatAgendaTime, formatCurrency } from '@/utils/formatters'

export interface AgendamentoDetailServiceItem {
  id: number | string
  servicoNome: string
  profissionalNome: string
  inicio: string
  fim: string
  valor: number
  status: string
}

withDefaults(
  defineProps<{
    itens: AgendamentoDetailServiceItem[]
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

function statusExibicao(status: string): string {
  return status === 'Agendado' ? 'Confirmado' : status
}
</script>

<template>
  <component
    :is="embedded ? 'div' : AgendamentoDetailSection"
    v-bind="embedded ? { class: 'agendamento-detail-embedded-services' } : { title: 'Serviços' }"
  >
    <p v-if="embedded" class="agendamento-detail-subsection-title">Serviços</p>
    <p v-if="itens.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
      Nenhum serviço neste agendamento.
    </p>
    <article
      v-for="(item, index) in itens"
      :key="item.id"
      class="agendamento-detail-service-fields"
      :class="{ 'agendamento-detail-service-fields--divided': index > 0 }"
    >
      <AgendamentoDetailField label="Serviço">
        <template #icon>
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="4.5" cy="4.5" r="2.2" stroke="currentColor" stroke-width="1.2" />
            <circle cx="11.5" cy="11.5" r="2.2" stroke="currentColor" stroke-width="1.2" />
            <path d="M6 6.2 10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            <path d="M10.2 5.2 5.2 10.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </template>
        {{ item.servicoNome }}
      </AgendamentoDetailField>

      <AgendamentoDetailField label="Profissional">
        <template #icon>
          <svg class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.2" />
            <path d="M5 19c0-3 3.1-5 7-5s7 2 7 5" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </template>
        {{ item.profissionalNome }}
      </AgendamentoDetailField>

      <AgendamentoDetailField label="Horário">
        <template #icon>
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
            <path d="M8 4.5V8L10 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </template>
        {{ formatAgendaTime(item.inicio) }} – {{ formatAgendaTime(item.fim) }}
      </AgendamentoDetailField>

      <AgendamentoDetailField label="Status" inline>
        <template #icon>
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
            <path d="M5.5 8.2 7.2 10l3.4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </template>
        <AgendamentoStatusBadge :status="statusExibicao(item.status)" />
      </AgendamentoDetailField>

      <AgendamentoDetailField label="Valor">
        <template #icon>
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M5.5 5.2c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.8 1 2.8 2.3S9.6 8.6 8 8.6 5.2 9.5 5.2 10.8c0 1.3 1.3 2.2 2.8 2.2 1 0 1.9-.4 2.5-1.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </template>
        {{ formatCurrency(item.valor) }}
      </AgendamentoDetailField>
    </article>
  </component>
</template>
