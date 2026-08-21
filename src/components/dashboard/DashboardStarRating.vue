<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  nota: number
  total: number
  loading?: boolean
}>()

const estrelas = computed(() => {
  const cheias = Math.round(props.nota)
  return Array.from({ length: 5 }, (_, i) => i < cheias)
})
</script>

<template>
  <div class="dashboard-star-rating">
    <div class="dashboard-star-rating__stars" aria-hidden="true">
      <span
        v-for="(cheia, index) in estrelas"
        :key="index"
        class="dashboard-star-rating__star"
        :class="{ 'dashboard-star-rating__star--filled': cheia }"
      >
        ★
      </span>
    </div>
    <p v-if="loading" class="dashboard-star-rating__meta">...</p>
    <p v-else class="dashboard-star-rating__meta">
      {{ total }} avaliação{{ total === 1 ? '' : 'ões' }}
    </p>
  </div>
</template>
