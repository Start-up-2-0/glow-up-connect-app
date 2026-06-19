<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pagina: number
  totalPaginas: number
  loading?: boolean
}>()

const emit = defineEmits<{ 'update:pagina': [value: number] }>()

const paginasVisiveis = computed(() => {
  const total = props.totalPaginas
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const current = props.pagina
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function irPara(pagina: number) {
  if (pagina < 1 || pagina > props.totalPaginas || pagina === props.pagina) return
  emit('update:pagina', pagina)
}
</script>

<template>
  <nav v-if="totalPaginas > 1" class="servicos-pagination" aria-label="Paginação de serviços">
    <div class="servicos-pagination__summary">
      <span>Página</span>
      <span class="servicos-pagination__current-box">{{ pagina }}</span>
      <span>de {{ totalPaginas }}</span>
    </div>

    <div class="servicos-pagination__controls">
      <button
        v-for="page in paginasVisiveis"
        :key="page"
        type="button"
        class="servicos-pagination__page"
        :class="{ 'servicos-pagination__page--active': page === pagina }"
        :disabled="loading"
        :aria-current="page === pagina ? 'page' : undefined"
        @click="irPara(page)"
      >
        {{ page }}
      </button>
    </div>
  </nav>
</template>
