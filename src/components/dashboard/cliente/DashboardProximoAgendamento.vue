<script setup lang="ts">
import { computed } from 'vue'
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import type { AgendamentoCliente } from '@/types/agendamento.types'
import { labelDiaAgendamento } from '@/utils/dashboardClienteUtils'
import { formatTime } from '@/utils/formatters'

const props = defineProps<{
  agendamento: AgendamentoCliente | null
  loading?: boolean
}>()

defineEmits<{
  explorar: []
  verDetalhe: [id: number]
}>()

const profissionalNome = computed(() => props.agendamento?.itens[0]?.profissionalNome ?? '')
const servicoNome = computed(() => props.agendamento?.itens[0]?.servicoNome ?? 'Atendimento')
</script>

<template>
  <section class="dashboard-proximo-agendamento">
    <div class="dashboard-proximo-agendamento__header">
      <span class="dashboard-proximo-agendamento__icon-wrap">
        <DashboardIcon name="calendar" class="dashboard-proximo-agendamento__icon" />
      </span>
      <div>
        <p class="dashboard-proximo-agendamento__eyebrow">Próximo agendamento</p>
        <h2 class="dashboard-proximo-agendamento__title">Seu próximo horário</h2>
      </div>
    </div>

    <div v-if="loading" class="dashboard-proximo-agendamento__skeleton">
      <span class="dashboard-skeleton dashboard-skeleton--line dashboard-skeleton--lg" />
      <span class="dashboard-skeleton dashboard-skeleton--line" />
      <span class="dashboard-skeleton dashboard-skeleton--line dashboard-skeleton--sm" />
    </div>

    <div v-else-if="!agendamento" class="dashboard-proximo-agendamento__empty">
      <span class="dashboard-proximo-agendamento__empty-icon">✂️</span>
      <p class="dashboard-proximo-agendamento__empty-title">Hora de cuidar do visual!</p>
      <p class="dashboard-proximo-agendamento__empty-desc">
        Encontre barbearias e salões próximos, compare avaliações e agende em poucos segundos.
      </p>
      <button type="button" class="dashboard-proximo-agendamento__cta" @click="$emit('explorar')">
        Explorar estabelecimentos
      </button>
    </div>

    <button
      v-else
      type="button"
      class="dashboard-proximo-agendamento__card"
      @click="$emit('verDetalhe', agendamento.id)"
    >
      <div class="dashboard-proximo-agendamento__when">
        <span class="dashboard-proximo-agendamento__day">{{ labelDiaAgendamento(agendamento.inicio) }}</span>
        <span class="dashboard-proximo-agendamento__time">{{ formatTime(agendamento.inicio) }}</span>
      </div>
      <div class="dashboard-proximo-agendamento__info">
        <p class="dashboard-proximo-agendamento__loja">{{ agendamento.estabelecimentoNome }}</p>
        <p class="dashboard-proximo-agendamento__meta">
          {{ servicoNome }}
          <template v-if="profissionalNome"> · {{ profissionalNome }}</template>
        </p>
      </div>
      <AgendamentoStatusBadge :status="agendamento.status" />
    </button>
  </section>
</template>
