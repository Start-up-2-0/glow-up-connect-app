<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import type { AgendaTimelineItem } from '@/utils/dashboardNegocioUtils'

defineProps<{
  timeline: AgendaTimelineItem[]
  loading?: boolean
}>()

defineEmits<{
  verAgenda: []
}>()
</script>

<template>
  <section class="dashboard-agenda-preview">
    <div class="dashboard-agenda-preview__header">
      <div>
        <h2 class="dashboard-agenda-preview__title">Próximos atendimentos</h2>
        <p class="dashboard-agenda-preview__subtitle">Agenda de hoje</p>
      </div>
      <button type="button" class="dashboard-panel__link" @click="$emit('verAgenda')">
        Ver agenda
        <DashboardIcon name="arrow-right" class="dashboard-panel__link-icon" />
      </button>
    </div>

    <div v-if="loading" class="dashboard-panel__empty">Carregando...</div>
    <div v-else-if="timeline.length === 0" class="dashboard-panel__empty dashboard-panel__empty--action">
      <span class="dashboard-panel__empty-icon-wrap">
        <DashboardIcon name="calendar" class="dashboard-panel__empty-icon" />
      </span>
      <p class="dashboard-panel__empty-title">Ainda não existem atendimentos</p>
      <p class="dashboard-panel__empty-desc">
        Quando um cliente for atendido, os horários aparecerão aqui.
      </p>
      <button type="button" class="dashboard-panel__empty-action" @click="$emit('verAgenda')">
        Ver agenda
      </button>
    </div>
    <ul v-else class="dashboard-agenda-preview__list">
      <li
        v-for="item in timeline"
        :key="item.id"
        class="dashboard-agenda-preview__row"
        :class="{ 'dashboard-agenda-preview__row--livre': item.tipo === 'livre' }"
      >
        <span class="dashboard-agenda-preview__time">{{ item.horario }}</span>
        <div class="dashboard-agenda-preview__content">
          <p class="dashboard-agenda-preview__label">{{ item.label }}</p>
          <AgendamentoStatusBadge v-if="item.status" :status="item.status" />
        </div>
      </li>
    </ul>
  </section>
</template>
