<script setup lang="ts">
defineProps<{
  receitaHoje: string
  agendamentos: number
  clientes: number
  cancelamentos: number
  ocupacao: string
  loading?: boolean
}>()
</script>

<template>
  <section class="dashboard-operacional">
    <div class="dashboard-operacional__head">
      <p class="dashboard-operacional__title">Hoje</p>
      <p class="dashboard-operacional__subtitle">Resumo operacional do dia</p>
    </div>
    <div class="dashboard-operacional__grid">
      <div class="dashboard-operacional__item">
        <p class="dashboard-operacional__label">Receita</p>
        <p class="dashboard-operacional__value dashboard-operacional__value--green">
          {{ loading ? '...' : receitaHoje }}
        </p>
      </div>
      <div class="dashboard-operacional__item">
        <p class="dashboard-operacional__label">Agendamentos</p>
        <p class="dashboard-operacional__value">{{ loading ? '...' : agendamentos }}</p>
      </div>
      <div class="dashboard-operacional__item">
        <p class="dashboard-operacional__label">Clientes</p>
        <p class="dashboard-operacional__value">{{ loading ? '...' : clientes }}</p>
      </div>
      <div class="dashboard-operacional__item">
        <p class="dashboard-operacional__label">Cancelamentos</p>
        <p class="dashboard-operacional__value">{{ loading ? '...' : cancelamentos }}</p>
      </div>
      <div class="dashboard-operacional__item">
        <p class="dashboard-operacional__label">Taxa ocupação</p>
        <p class="dashboard-operacional__value">{{ loading ? '...' : ocupacao }}</p>
      </div>
    </div>
  </section>
</template>
