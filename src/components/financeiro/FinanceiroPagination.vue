<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pagina: number
  totalPaginas: number
  total: number
  tamanhoPagina?: number
}>()

const emit = defineEmits<{
  anterior: []
  proxima: []
  irPara: [pagina: number]
}>()

const inicio = computed(() => (props.pagina - 1) * (props.tamanhoPagina ?? 20) + 1)
const fim = computed(() => Math.min(props.pagina * (props.tamanhoPagina ?? 20), props.total))

const paginasVisiveis = computed(() => {
  const pages: number[] = []
  const max = props.totalPaginas
  const current = props.pagina
  const start = Math.max(1, current - 2)
  const end = Math.min(max, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<template>
  <div class="financeiro-pagination financeiro-no-print">
    <p class="financeiro-pagination__info">
      <template v-if="total > 0">
        Mostrando <strong>{{ inicio }}–{{ fim }}</strong> de <strong>{{ total }}</strong> resultados
      </template>
      <template v-else>Nenhum resultado</template>
    </p>

    <div v-if="totalPaginas > 1" class="financeiro-pagination__controls">
      <button
        type="button"
        class="financeiro-btn-outline financeiro-pagination__nav"
        :disabled="pagina <= 1"
        aria-label="Página anterior"
        @click="emit('anterior')"
      >
        ‹
      </button>
      <button
        v-for="p in paginasVisiveis"
        :key="p"
        type="button"
        class="financeiro-pagination__page"
        :class="{ 'financeiro-pagination__page--active': p === pagina }"
        @click="emit('irPara', p)"
      >
        {{ p }}
      </button>
      <button
        type="button"
        class="financeiro-btn-outline financeiro-pagination__nav"
        :disabled="pagina >= totalPaginas"
        aria-label="Próxima página"
        @click="emit('proxima')"
      >
        ›
      </button>
    </div>
  </div>
</template>
