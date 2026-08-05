<script setup lang="ts">
import { ChevronRight, FileText, Network, TrendingUp } from 'lucide-vue-next'

defineProps<{
  lucro: string
  lucroPositivo: boolean
  contas: string
  contasHint?: string
  comissoes: string
}>()

defineEmits<{
  contas: []
  comissoes: []
}>()
</script>

<template>
  <section class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
    <div
      class="flex items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 shadow-glow-sm"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
      >
        <TrendingUp class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-xs text-glow-text-subtle">Lucro</p>
        <p
          class="truncate font-satoshi text-lg font-bold"
          :class="lucroPositivo ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'"
        >
          {{ lucro }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="flex items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 text-left shadow-glow-sm transition hover:bg-glow-hover-surface"
      @click="$emit('contas')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-400"
      >
        <FileText class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-xs text-glow-text-subtle">Contas em aberto</p>
        <p class="truncate font-satoshi text-lg font-bold text-glow-text">{{ contas }}</p>
        <p v-if="contasHint" class="font-urbanist text-[11px] text-glow-text-subtle">
          {{ contasHint }}
        </p>
      </div>
      <ChevronRight class="size-4 shrink-0 text-glow-text-subtle" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="flex items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 text-left shadow-glow-sm transition hover:bg-glow-hover-surface"
      @click="$emit('comissoes')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-glow-gold/15 text-glow-gold-cta"
      >
        <Network class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-xs text-glow-text-subtle">Comissões</p>
        <p class="truncate font-satoshi text-lg font-bold text-glow-text">{{ comissoes }}</p>
        <p class="font-urbanist text-[11px] text-glow-text-subtle">Este mês</p>
      </div>
      <ChevronRight class="size-4 shrink-0 text-glow-text-subtle" aria-hidden="true" />
    </button>
  </section>
</template>
