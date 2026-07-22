<script setup lang="ts">
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import type { TimelineGroup } from '@/utils/dashboardClienteUtils'
import { formatCurrency, formatTime } from '@/utils/formatters'

defineProps<{
  groups: TimelineGroup[]
  loading?: boolean
}>()

defineEmits<{
  verTodos: []
  explorar: []
}>()
</script>

<template>
  <section class="dashboard-timeline">
    <div class="dashboard-timeline__header">
      <div>
        <h2 class="dashboard-timeline__title">Histórico</h2>
        <p class="dashboard-timeline__subtitle">Sua linha do tempo de atendimentos</p>
      </div>
      <button type="button" class="dashboard-panel__link" @click="$emit('verTodos')">
        Ver todos
        <DashboardIcon name="arrow-right" class="dashboard-panel__link-icon" />
      </button>
    </div>

    <div v-if="loading" class="dashboard-timeline__skeleton">
      <span class="dashboard-skeleton dashboard-skeleton--line" />
      <span class="dashboard-skeleton dashboard-skeleton--line dashboard-skeleton--sm" />
    </div>

    <div v-else-if="groups.length === 0" class="dashboard-timeline__empty dashboard-timeline__empty--compact">
      <p class="dashboard-timeline__empty-title">Sua linha do tempo aparecerá aqui</p>
      <p class="dashboard-timeline__empty-desc">Agende um serviço para acompanhar seu histórico.</p>
      <button type="button" class="dashboard-timeline__cta" @click="$emit('explorar')">
        Explorar lojas
      </button>
    </div>

    <div v-else class="dashboard-timeline__groups">
      <section v-for="group in groups" :key="group.id" class="dashboard-timeline__group">
        <p class="dashboard-timeline__group-label">{{ group.label }}</p>
        <ul class="dashboard-timeline__list">
          <li v-for="item in group.items" :key="item.id" class="dashboard-timeline__row">
            <span class="dashboard-timeline__check">✔</span>
            <div class="dashboard-timeline__main">
              <p class="dashboard-timeline__service">{{ item.itens[0]?.servicoNome ?? 'Atendimento' }}</p>
              <p class="dashboard-timeline__meta">
                {{ item.estabelecimentoNome }} · {{ formatTime(item.inicio) }} · {{ formatCurrency(item.valorTotal) }}
              </p>
            </div>
            <AgendamentoStatusBadge :status="item.status" />
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
