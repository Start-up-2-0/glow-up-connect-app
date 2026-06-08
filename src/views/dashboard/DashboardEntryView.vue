<script setup lang="ts">
import ClienteHomeView from '@/views/dashboard/cliente/ClienteHomeView.vue'
import DashboardNegocioResumo from '@/views/dashboard/DashboardNegocioResumo.vue'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'

const { temContextoOperacional } = useAcessoUsuario()
</script>

<template>
  <div class="space-y-6 lg:space-y-8">
    <ClienteHomeView :compact="temContextoOperacional" />
    <DashboardNegocioResumo v-if="temContextoOperacional" />
  </div>
</template>
