<script setup lang="ts">
import { FileText, Network } from 'lucide-vue-next'

defineProps<{
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
  <section class="flex h-full flex-col gap-3">
    <button
      type="button"
      class="group flex flex-1 items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 text-left shadow-glow-sm transition hover:border-glow-gold hover:bg-glow-hover-surface"
      @click="$emit('contas')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-600 transition group-hover:scale-105 dark:text-sky-400"
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
    </button>

    <button
      type="button"
      class="group flex flex-1 items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 text-left shadow-glow-sm transition hover:border-glow-gold hover:bg-glow-hover-surface"
      @click="$emit('comissoes')"
    >
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-glow-gold/15 text-glow-gold-cta transition group-hover:scale-105"
      >
        <Network class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-xs text-glow-text-subtle">Comissões do período</p>
        <p class="truncate font-satoshi text-lg font-bold text-glow-text">{{ comissoes }}</p>
        <p class="font-urbanist text-[11px] text-glow-text-subtle">Ver detalhamento</p>
      </div>
    </button>
  </section>
</template>
