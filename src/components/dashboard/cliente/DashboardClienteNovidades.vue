<script setup lang="ts">
import type { ClienteNovidade } from '@/utils/dashboardClienteUtils'

defineProps<{
  items: ClienteNovidade[]
  loading?: boolean
}>()

const iconMap = {
  spark: '✨',
  star: '⭐',
  gift: '🎉',
  calendar: '📅',
} as const
</script>

<template>
  <section v-if="loading || items.length" class="dashboard-novidades">
    <h2 class="dashboard-novidades__title">Novidades</h2>
    <ul class="dashboard-novidades__list">
      <li v-for="item in items" :key="item.id" class="dashboard-novidades__item">
        <span class="dashboard-novidades__icon">{{ iconMap[item.icon] }}</span>
        <p class="dashboard-novidades__message">{{ item.message }}</p>
      </li>
    </ul>
  </section>
</template>
