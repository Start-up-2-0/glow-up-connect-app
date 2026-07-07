<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  items: { label: string; description: string; to: string }[]
}>()
</script>

<template>
  <div class="financeiro-atalhos-grid">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="financeiro-atalho-card"
    >
      <span class="financeiro-atalho-card__label">{{ item.label }}</span>
      <span class="financeiro-atalho-card__desc">{{ item.description }}</span>
    </RouterLink>
  </div>
</template>
