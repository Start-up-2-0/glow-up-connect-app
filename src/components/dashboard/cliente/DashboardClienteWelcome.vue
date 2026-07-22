<script setup lang="ts">
defineProps<{
  titulo: string
  subtitulo: string
  loading?: boolean
}>()
</script>

<template>
  <header class="dashboard-cliente-hero">
    <div class="dashboard-cliente-hero__glow" aria-hidden="true" />
    <div class="dashboard-cliente-hero__content">
      <p v-if="loading" class="dashboard-cliente-hero__title dashboard-cliente-hero__title--loading">...</p>
      <h1 v-else class="dashboard-cliente-hero__title">{{ titulo }}</h1>
      <p v-if="loading" class="dashboard-cliente-hero__subtitle">Carregando seu painel...</p>
      <p v-else class="dashboard-cliente-hero__subtitle">{{ subtitulo }}</p>
    </div>
  </header>
</template>
