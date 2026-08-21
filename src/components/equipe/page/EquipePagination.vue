<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  pagina: number
  totalPaginas: number
  total: number
  inicio: number
  fim: number
}>()

defineEmits<{
  anterior: []
  proxima: []
  ir: [pagina: number]
}>()
</script>

<template>
  <footer class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
    <div class="inline-flex items-center gap-1">
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-xl border border-glow-border-soft text-glow-text-subtle transition hover:bg-glow-hover-surface disabled:opacity-40"
        :disabled="pagina <= 1"
        aria-label="Página anterior"
        @click="$emit('anterior')"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
      </button>
      <button
        v-for="p in totalPaginas"
        :key="p"
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-xl font-urbanist text-sm font-semibold transition"
        :class="
          p === pagina
            ? 'bg-glow-gold-cta text-white'
            : 'text-glow-text-subtle hover:bg-glow-hover-surface'
        "
        @click="$emit('ir', p)"
      >
        {{ p }}
      </button>
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-xl border border-glow-border-soft text-glow-text-subtle transition hover:bg-glow-hover-surface disabled:opacity-40"
        :disabled="pagina >= totalPaginas"
        aria-label="Próxima página"
        @click="$emit('proxima')"
      >
        <ChevronRight class="size-4" aria-hidden="true" />
      </button>
    </div>
    <p class="font-urbanist text-xs text-glow-text-subtle">
      Mostrando {{ inicio }} a {{ fim }} de {{ total }} membros
    </p>
  </footer>
</template>
