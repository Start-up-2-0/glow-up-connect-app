<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import { normalizarModoAcao } from '@/constants/equipeAdicionarAcoes'
import { ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const router = useRouter()
const loading = useLoading()

onMounted(async () => {
  loading.open({ message: 'Redirecionando...' })
  try {
    const query: Record<string, string> = {}
    const acao = normalizarModoAcao(route.query.acao ?? route.query.modo)
    if (acao) query.acao = acao
    if (route.query.role === 'Profissional') query.role = 'Profissional'
    await router.replace({ path: ROUTE_PATHS.CONFIG_EQUIPE, query })
  } finally {
    loading.close()
  }
})
</script>

<template>
  <div />
</template>
