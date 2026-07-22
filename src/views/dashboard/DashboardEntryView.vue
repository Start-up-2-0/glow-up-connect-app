<script setup lang="ts">
import { computed, onMounted } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import DashboardClienteView from '@/views/dashboard/DashboardClienteView.vue'
import DashboardNegocioView from '@/views/dashboard/DashboardNegocioView.vue'
import DashboardProfissionalView from '@/views/dashboard/DashboardProfissionalView.vue'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'

const { dashboardRole } = useDashboardRole()
const negocioStore = useNegocioStore()
const userStore = useUserStore()

const dashboardComponent = computed(() => {
  if (dashboardRole.value === 'profissional') return DashboardProfissionalView
  if (dashboardRole.value === 'negocio') return DashboardNegocioView
  return DashboardClienteView
})

const bootstrapping = computed(() => userStore.loading || negocioStore.loading)

onMounted(async () => {
  const tasks: Promise<unknown>[] = []
  if (!userStore.profile) tasks.push(userStore.fetchMe())
  if (negocioStore.estabelecimentos.length === 0) {
    tasks.push(negocioStore.fetchEstabelecimentos())
  }
  await Promise.all(tasks)
})
</script>

<template>
  <LoadingSpinner v-if="bootstrapping" />
  <component :is="dashboardComponent" v-else />
</template>
