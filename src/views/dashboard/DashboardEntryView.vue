<script setup lang="ts">
import ClienteHomeView from '@/views/dashboard/cliente/ClienteHomeView.vue'
import DashboardNegocioResumo from '@/views/dashboard/DashboardNegocioResumo.vue'
import ProfissionalOperacaoAtalhos from '@/views/dashboard/ProfissionalOperacaoAtalhos.vue'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'

const { temContextoOperacional, ehProfissionalOperacional } = useAcessoUsuario()
</script>

<template>
  <div class="space-y-6 lg:space-y-8">
    <ClienteHomeView :compact="temContextoOperacional" />
    <ProfissionalOperacaoAtalhos v-if="ehProfissionalOperacional" />
    <DashboardNegocioResumo
      v-else-if="temContextoOperacional"
    />
  </div>
</template>
