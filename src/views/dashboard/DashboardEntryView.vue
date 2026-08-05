<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardClienteView from '@/views/dashboard/DashboardClienteView.vue'
import DashboardNegocioView from '@/views/dashboard/DashboardNegocioView.vue'
import DashboardProfissionalView from '@/views/dashboard/DashboardProfissionalView.vue'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useLoading } from '@/composables/useLoading'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'

const { dashboardRole } = useDashboardRole()
const negocioStore = useNegocioStore()
const userStore = useUserStore()
const globalLoading = useLoading()

const bootstrapping = ref(true)

const dashboardComponent = computed(() => {
  if (dashboardRole.value === 'profissional') return DashboardProfissionalView
  if (dashboardRole.value === 'negocio') return DashboardNegocioView
  return DashboardClienteView
})

onMounted(async () => {
  globalLoading.open({ message: 'Preparando seu dashboard...' })
  try {
    const tasks: Promise<unknown>[] = []
    if (!userStore.profile) tasks.push(userStore.fetchMe())
    if (negocioStore.estabelecimentos.length === 0) {
      tasks.push(negocioStore.fetchEstabelecimentos())
    }
    await Promise.all(tasks)
  } finally {
    bootstrapping.value = false
    globalLoading.close()
  }
})
</script>

<template>
  <component :is="dashboardComponent" v-if="!bootstrapping" />
</template>
