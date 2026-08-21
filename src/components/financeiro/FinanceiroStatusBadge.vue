<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const variant = computed(() => {
  const s = props.status.toLowerCase()
  if (s.includes('cancel')) return 'cancelada'
  if (s.includes('vencid')) return 'vencida'
  if (s.includes('estorn')) return 'estornada'
  if (s.includes('pendent') || s.includes('receber') || s.includes('pagar')) return 'pendente'
  if (s.includes('receb') || s.includes('pago') || s.includes('baixad')) return 'recebida'
  return 'aberta'
})
</script>

<template>
  <span class="financeiro-badge" :class="`financeiro-badge--${variant}`">
    <span class="financeiro-badge__dot" aria-hidden="true" />
    {{ status }}
  </span>
</template>
