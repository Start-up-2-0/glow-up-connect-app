<script setup lang="ts">
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import { formatAgendaTime, formatCurrency, initialsFromName } from '@/utils/formatters'

export interface AgendamentoDetailServiceItem {
  id: number | string
  servicoNome: string
  profissionalNome: string
  inicio: string
  valor: number
}

defineProps<{
  itens: AgendamentoDetailServiceItem[]
}>()
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
        </div>
        <div class="agendamento-detail-service-side">
          <p class="agendamento-detail-service-time">{{ formatAgendaTime(item.inicio) }}</p>
          <p class="agendamento-detail-service-price">{{ formatCurrency(item.valor) }}</p>
        </div>
      </article>
    </div>
  </AgendamentoDetailSection>
</template>
