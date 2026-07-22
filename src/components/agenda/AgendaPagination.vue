<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pagina: number
  totalPaginas: number
  total: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:pagina': [value: number]
}>()

const podeAnterior = computed(() => props.pagina > 1)
const podeProxima = computed(() => props.pagina < props.totalPaginas)

function irPara(pagina: number) {
  if (pagina < 1 || pagina > props.totalPaginas || pagina === props.pagina) return
  emit('update:pagina', pagina)
}
</script>

<template>
  <div class="agenda-pagination">
    <p class="agenda-pagination__summary">
      {{ total }} agendamento{{ total === 1 ? '' : 's' }}
      <span v-if="totalPaginas > 1">· Página {{ pagina }} de {{ totalPaginas }}</span>
    </p>

    <div v-if="totalPaginas > 1" class="agenda-pagination__controls">
      <button
        type="button"
        class="agenda-pagination__button"
        :disabled="loading || !podeAnterior"
        @click="irPara(pagina - 1)"
      >
        Anterior
      </button>
      <button
        type="button"
        class="agenda-pagination__button"
        :disabled="loading || !podeProxima"
        @click="irPara(pagina + 1)"
      >
        Próxima
      </button>
    </div>
  </div>
</template>
