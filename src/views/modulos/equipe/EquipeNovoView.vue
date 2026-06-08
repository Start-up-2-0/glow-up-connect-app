<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()

onMounted(async () => {
  await router.replace({
    path: ROUTE_PATHS.CONFIG_EQUIPE_USUARIO_NOVO,
    query: { role: 'Profissional' },
  })
})
</script>

<template>
  <LoadingSpinner />
</template>
