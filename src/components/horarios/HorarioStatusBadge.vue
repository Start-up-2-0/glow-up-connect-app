<script setup lang="ts">
defineProps<{
  ativo: boolean
}>()
</script>

<template>
  <span
    class="horario-status-badge"
    :class="ativo ? 'horario-status-badge--ativo' : 'horario-status-badge--inativo'"
  >
    {{ ativo ? 'Ativo' : 'Inativo' }}
  </span>
</template>
