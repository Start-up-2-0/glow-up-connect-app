<script setup lang="ts">
import { computed } from 'vue'
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import type { DistribuicaoServico } from '@/utils/dashboardNegocioUtils'

const props = defineProps<{
  data: DistribuicaoServico[]
  loading?: boolean
}>()

const max = computed(() => Math.max(...props.data.map((d) => d.count), 1))
const empty = computed(() => props.data.length === 0)
</script>

<template>
  <section class="dashboard-chart-card">
    <div class="dashboard-chart-card__header">
      <div class="dashboard-chart-card__title-row">
        <span class="dashboard-chart-card__icon-wrap dashboard-chart-card__icon-wrap--yellow">
          <DashboardIcon name="scissors" class="dashboard-chart-card__icon" />
        </span>
        <div>
          <h2 class="dashboard-chart-card__title">Distribuição de serviços</h2>
          <p class="dashboard-chart-card__subtitle">Atendimentos no período</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="dashboard-chart-card__empty">Carregando...</div>
    <div v-else-if="empty" class="dashboard-chart-card__empty">
      <p class="dashboard-chart-card__empty-title">Nenhum atendimento registrado</p>
      <p class="dashboard-chart-card__empty-desc">
        Os serviços mais realizados aparecerão aqui conforme a agenda for preenchida.
      </p>
    </div>
    <ul v-else class="dashboard-distribution">
      <li v-for="item in data" :key="item.nome" class="dashboard-distribution__row">
        <div class="dashboard-distribution__head">
          <span class="dashboard-distribution__name">{{ item.nome }}</span>
          <span class="dashboard-distribution__count">{{ item.count }}</span>
        </div>
        <div class="dashboard-distribution__track">
          <span
            class="dashboard-distribution__bar"
            :style="{ width: `${Math.max(8, Math.round((item.count / max) * 100))}%` }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
