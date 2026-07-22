<script setup lang="ts">
defineProps<{
  pagina: number
  totalPaginas: number
  total: number
}>()

const emit = defineEmits<{
  anterior: []
  proxima: []
}>()
</script>

<template>
  <div class="financeiro-no-print flex flex-wrap items-center justify-between gap-3 pt-4">
    <p class="font-urbanist text-sm text-glow-text-subtle">{{ total }} registro(s)</p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="financeiro-btn-outline"
        :disabled="pagina <= 1"
        @click="emit('anterior')"
      >
        Anterior
      </button>
      <span class="font-urbanist text-sm text-glow-text">{{ pagina }} / {{ totalPaginas }}</span>
      <button
        type="button"
        class="financeiro-btn-outline"
        :disabled="pagina >= totalPaginas"
        @click="emit('proxima')"
      >
        Próxima
      </button>
    </div>
  </div>
</template>
