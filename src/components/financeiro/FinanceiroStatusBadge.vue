<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const variant = computed(() => {
  const s = props.status.toLowerCase()
  if (s.includes('vencid')) return 'vencida'
  if (s.includes('paga') || s.includes('baixad')) return 'baixada'
  if (s.includes('estorn')) return 'estornada'
  return 'aberta'
})
</script>

<template>
  <span class="financeiro-badge" :class="`financeiro-badge--${variant}`">
    {{ status }}
  </span>
</template>
