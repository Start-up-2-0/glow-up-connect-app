<script setup lang="ts">
import { ShoppingCart, CircleDollarSign, BarChart3 } from 'lucide-vue-next'

export interface FinanceiroQuickAction {
  id: string
  label: string
  icon: 'venda' | 'despesa' | 'export' | 'relatorio' | 'grafico'
}

defineProps<{
  actions: FinanceiroQuickAction[]
}>()

defineEmits<{
  action: [id: string]
}>()

const iconMap = {
  venda: ShoppingCart,
  despesa: CircleDollarSign,
  grafico: BarChart3,
  export: BarChart3,
  relatorio: BarChart3,
} as const

const toneMap: Record<string, string> = {
  venda: 'bg-glow-gold/15 text-glow-gold-cta',
  despesa: 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
  grafico: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  export: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  relatorio: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
}
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-satoshi text-sm font-bold text-glow-text">Ações rápidas</h2>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="flex items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-3.5 text-left font-urbanist text-sm font-medium text-glow-text shadow-glow-sm transition hover:bg-glow-hover-surface"
        @click="$emit('action', action.id)"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl"
          :class="toneMap[action.icon] ?? toneMap.grafico"
        >
          <component :is="iconMap[action.icon]" class="size-4.5 size-4" aria-hidden="true" />
        </span>
        <span>{{ action.label }}</span>
      </button>
    </div>
  </section>
</template>
