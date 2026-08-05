<script setup lang="ts">
import { Download } from 'lucide-vue-next'

defineProps<{
  titulo?: string
  subtitulo?: string
  podeExportar?: boolean
}>()

const emit = defineEmits<{ exportar: [] }>()
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
        {{ titulo ?? 'Faturas' }}
      </h1>
      <p class="mt-1.5 max-w-xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        {{
          subtitulo ?? 'Acompanhe seu histórico de faturamento e pagamentos.'
        }}
      </p>
    </div>
    <button
      type="button"
      class="assinatura-btn-secondary"
      :disabled="podeExportar === false"
      @click="emit('exportar')"
    >
      <Download :size="16" :stroke-width="1.75" />
      Exportar
    </button>
  </header>
</template>
