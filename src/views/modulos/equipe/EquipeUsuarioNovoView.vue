<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { normalizarModoAcao } from '@/constants/equipeAdicionarAcoes'
import { ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const query: Record<string, string> = {}
  const acao = normalizarModoAcao(route.query.acao ?? route.query.modo)
  if (acao) query.acao = acao
  if (route.query.role === 'Profissional') query.role = 'Profissional'
  void router.replace({ path: ROUTE_PATHS.CONFIG_EQUIPE, query })
})
</script>

<template>
  <LoadingSpinner />
</template>
