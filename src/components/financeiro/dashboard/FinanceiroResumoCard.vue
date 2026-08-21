<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  entradas: string
  saidas: string
  lucro: string
  mediaDiaria: string
  lucroPositivo?: boolean
}>()

defineEmits<{
  verRelatorio: []
}>()
</script>

<template>
  <aside
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <h2 class="font-satoshi text-base font-bold text-glow-text">Resumo do período</h2>

    <dl class="mt-5 flex-1 space-y-4">
      <div class="flex items-start justify-between gap-3">
        <dt class="font-urbanist text-sm text-glow-text-subtle">Total de entradas</dt>
        <dd class="font-satoshi text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {{ entradas }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="font-urbanist text-sm text-glow-text-subtle">Total de saídas</dt>
        <dd class="font-satoshi text-sm font-bold text-rose-600 dark:text-rose-400">
          {{ saidas }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-3 border-t border-glow-border-soft pt-4">
        <dt class="font-urbanist text-sm text-glow-text-subtle">Lucro líquido</dt>
        <dd
          class="font-satoshi text-sm font-bold"
          :class="lucroPositivo === false ? 'text-rose-600' : 'text-glow-gold-cta'"
        >
          {{ lucro }}
        </dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="font-urbanist text-sm text-glow-text-subtle">Média diária de lucro</dt>
        <dd class="font-satoshi text-sm font-semibold text-glow-text">{{ mediaDiaria }}</dd>
      </div>
    </dl>

    <button
      type="button"
      class="mt-6 inline-flex items-center gap-1 font-urbanist text-sm font-semibold text-glow-gold-cta transition hover:brightness-110"
      @click="$emit('verRelatorio')"
    >
      Ver relatório completo
      <ChevronRight class="size-4" aria-hidden="true" />
    </button>
  </aside>
</template>
