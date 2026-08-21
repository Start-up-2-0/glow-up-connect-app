<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'

const DashboardClienteView = defineAsyncComponent(
  () => import('@/views/dashboard/DashboardClienteView.vue'),
)
const DashboardNegocioView = defineAsyncComponent(
  () => import('@/views/dashboard/DashboardNegocioView.vue'),
)
const DashboardProfissionalView = defineAsyncComponent(
  () => import('@/views/dashboard/DashboardProfissionalView.vue'),
)

const { dashboardRole } = useDashboardRole()
const negocioStore = useNegocioStore()
const userStore = useUserStore()

const bootstrapping = ref(true)

const dashboardComponent = computed(() => {
  if (dashboardRole.value === 'profissional') return DashboardProfissionalView
  if (dashboardRole.value === 'negocio') return DashboardNegocioView
  return DashboardClienteView
})

onMounted(async () => {
  try {
    const tasks: Promise<unknown>[] = []
    if (!userStore.profile) tasks.push(userStore.fetchMe())
    // Cache inclusive lista vazia (cliente puro) — evita refetch duplicado.
    if (!negocioStore.estabelecimentosLoaded) {
      tasks.push(negocioStore.fetchEstabelecimentos())
    }
    if (tasks.length > 0) await Promise.all(tasks)
  } finally {
    bootstrapping.value = false
  }
})
</script>

<template>
  <!-- Skeleton mínimo enquanto resolve role/contexto — sem overlay fullscreen. -->
  <div v-if="bootstrapping" class="space-y-4 p-1" aria-busy="true" aria-label="Preparando dashboard">
    <div class="h-8 w-48 animate-pulse rounded-lg bg-glow-surface-tint" />
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="h-24 animate-pulse rounded-xl bg-glow-surface-tint" />
      <div class="h-24 animate-pulse rounded-xl bg-glow-surface-tint" />
      <div class="h-24 animate-pulse rounded-xl bg-glow-surface-tint" />
    </div>
  </div>
  <component :is="dashboardComponent" v-else />
</template>
