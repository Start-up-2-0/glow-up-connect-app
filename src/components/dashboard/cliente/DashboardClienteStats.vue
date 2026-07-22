<script setup lang="ts">
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import DashboardTrendBadge from '@/components/dashboard/DashboardTrendBadge.vue'

defineProps<{
  gasto: string
  atendimentos: number
  favoritos: number
  trend?: number | null
  loading?: boolean
}>()
</script>

<template>
  <section class="dashboard-cliente-stats">
    <div class="dashboard-cliente-stats__item">
      <span class="dashboard-cliente-stats__icon-wrap dashboard-cliente-stats__icon-wrap--money">
        <DashboardIcon name="money" class="dashboard-cliente-stats__icon" />
      </span>
      <div>
        <p class="dashboard-cliente-stats__label">Gasto este mês</p>
        <p class="dashboard-cliente-stats__value">{{ loading ? '...' : gasto }}</p>
        <DashboardTrendBadge v-if="!loading && trend != null" :value="trend" label="vs mês passado" />
        <p v-else-if="!loading && atendimentos > 0" class="dashboard-cliente-stats__hint">
          {{ atendimentos }} atendimento{{ atendimentos === 1 ? '' : 's' }}
        </p>
      </div>
    </div>

    <div class="dashboard-cliente-stats__item">
      <span class="dashboard-cliente-stats__icon-wrap dashboard-cliente-stats__icon-wrap--calendar">
        <DashboardIcon name="calendar" class="dashboard-cliente-stats__icon" />
      </span>
      <div>
        <p class="dashboard-cliente-stats__label">Agendamentos</p>
        <p class="dashboard-cliente-stats__value">{{ loading ? '...' : atendimentos }}</p>
        <p class="dashboard-cliente-stats__hint">Concluídos no mês</p>
      </div>
    </div>

    <div class="dashboard-cliente-stats__item">
      <span class="dashboard-cliente-stats__icon-wrap dashboard-cliente-stats__icon-wrap--heart">
        <DashboardIcon name="heart" class="dashboard-cliente-stats__icon" />
      </span>
      <div>
        <p class="dashboard-cliente-stats__label">Favoritos</p>
        <p class="dashboard-cliente-stats__value">{{ loading ? '...' : favoritos }}</p>
        <p class="dashboard-cliente-stats__hint">Lojas e profissionais</p>
      </div>
    </div>
  </section>
</template>
