<script setup lang="ts">
import type { Component } from 'vue'
import StatCard from '@/components/dashboard/cliente/StatCard.vue'

export interface FaturaStat {
  id: string
  label: string
  value: string
  icon: Component
  iconClass?: string
  hint?: string | null
}

defineProps<{
  items: FaturaStat[]
  loading?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
    <StatCard
      v-for="item in items"
      :key="item.id"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
      :icon-class="item.iconClass"
      :hint="item.hint"
      :loading="loading"
    />
  </div>
</template>
