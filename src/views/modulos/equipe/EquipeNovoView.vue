<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from '@/composables/useLoading'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()
const loading = useLoading()

onMounted(async () => {
  loading.open({ message: 'Redirecionando...' })
  try {
    await router.replace({
      path: ROUTE_PATHS.CONFIG_EQUIPE,
      query: { acao: 'convite', role: 'Profissional' },
    })
  } finally {
    loading.close()
  }
})
</script>

<template>
  <div />
</template>
