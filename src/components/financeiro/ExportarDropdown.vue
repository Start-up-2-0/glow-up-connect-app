<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Download } from 'lucide-vue-next'
import type { ExportFormato } from '@/types/negocio/caixa.types'

const emit = defineEmits<{
  export: [formato: ExportFormato]
  print: []
}>()

const open = ref(false)

function select(formato: ExportFormato) {
  emit('export', formato)
  open.value = false
}

function imprimir() {
  emit('print')
  open.value = false
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex h-9 items-center gap-2 rounded-xl border border-glow-border-soft bg-glow-surface px-3.5 font-urbanist text-sm font-medium text-glow-text shadow-glow-sm transition hover:bg-glow-hover-surface"
      @click="open = !open"
    >
      <Download class="size-4 text-glow-text-subtle" aria-hidden="true" />
      Exportar
      <ChevronDown class="size-3.5 text-glow-text-subtle" aria-hidden="true" />
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-20 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
    >
      <button
        type="button"
        class="block w-full px-4 py-2 text-left font-urbanist text-sm hover:bg-glow-hover-surface"
        @click="select('csv')"
      >
        Planilha (CSV)
      </button>
      <button
        type="button"
        class="block w-full px-4 py-2 text-left font-urbanist text-sm hover:bg-glow-hover-surface"
        @click="select('xlsx')"
      >
        Excel
      </button>
      <button
        type="button"
        class="block w-full px-4 py-2 text-left font-urbanist text-sm hover:bg-glow-hover-surface"
        @click="select('pdf')"
      >
        PDF
      </button>
      <button
        type="button"
        class="block w-full px-4 py-2 text-left font-urbanist text-sm hover:bg-glow-hover-surface"
        @click="imprimir"
      >
        Imprimir
      </button>
    </div>
  </div>
</template>
