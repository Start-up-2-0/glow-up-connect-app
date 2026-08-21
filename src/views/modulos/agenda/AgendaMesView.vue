<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()

onMounted(() => {
  void router.replace({ path: ROUTE_PATHS.AGENDA, query: { visao: 'mes' } })
})
</script>

<template>
  <div class="agenda-page">
    <p class="font-urbanist text-sm text-glow-text-subtle">Redirecionando…</p>
  </div>
</template>
