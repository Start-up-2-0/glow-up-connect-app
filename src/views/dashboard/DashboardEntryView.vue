<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ClienteHomeView from '@/views/dashboard/cliente/ClienteHomeView.vue'
import DashboardHomeView from '@/views/dashboard/DashboardHomeView.vue'
import { useUserStore } from '@/stores/user.store'
import { isClienteRole } from '@/types/user.types'

const { profile } = storeToRefs(useUserStore())

const isCliente = computed(() => isClienteRole(profile.value?.role))
</script>

<template>
  <ClienteHomeView v-if="isCliente" />
  <DashboardHomeView v-else />
</template>
