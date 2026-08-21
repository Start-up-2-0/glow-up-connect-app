<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const label = computed(() => {
  switch (props.status) {
    case 'Ativo':
      return 'Ativo'
    case 'Cancelado':
      return 'Cancelado'
    case 'Expirado':
      return 'Expirado'
    case 'Esgotado':
      return 'Esgotado'
    default:
      return props.status
  }
})

const badgeClass = computed(() => {
  switch (props.status) {
    case 'Ativo':
      return 'equipe-convite-status-badge--ativo'
    case 'Cancelado':
      return 'equipe-convite-status-badge--cancelado'
    case 'Expirado':
    case 'Esgotado':
      return 'equipe-convite-status-badge--indisponivel'
    default:
      return 'equipe-convite-status-badge--indisponivel'
  }
})
</script>

<template>
  <span class="equipe-convite-status-badge" :class="badgeClass">
    {{ label }}
  </span>
</template>
