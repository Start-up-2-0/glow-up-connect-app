<script setup lang="ts">
import { CalendarDays, Lock, RefreshCw, ShieldCheck } from 'lucide-vue-next'

defineProps<{
  diasTrial?: number
}>()
</script>

<template>
  <section
    class="rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-5 shadow-glow-sm sm:px-6"
  >
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
      <div class="flex items-start gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-glow-gold/15 text-glow-gold-cta"
        >
          <ShieldCheck class="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 class="font-satoshi text-sm font-bold text-glow-text">Seguro e confiável</h2>
          <p class="mt-0.5 max-w-md font-urbanist text-xs leading-relaxed text-glow-text-subtle sm:text-sm">
            Seus dados ficam protegidos. Cancele quando quiser, sem fidelidade.
          </p>
        </div>
      </div>

      <ul class="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <li
          class="flex items-center gap-2 rounded-xl border border-glow-border-soft bg-glow-hover-surface px-3 py-2.5"
        >
          <CalendarDays class="size-4 shrink-0 text-glow-gold-cta" aria-hidden="true" />
          <span class="font-urbanist text-xs font-medium text-glow-text">
            {{ diasTrial ?? 14 }} dias grátis
          </span>
        </li>
        <li
          class="flex items-center gap-2 rounded-xl border border-glow-border-soft bg-glow-hover-surface px-3 py-2.5"
        >
          <RefreshCw class="size-4 shrink-0 text-glow-gold-cta" aria-hidden="true" />
          <span class="font-urbanist text-xs font-medium text-glow-text">Cancele quando quiser</span>
        </li>
        <li
          class="flex items-center gap-2 rounded-xl border border-glow-border-soft bg-glow-hover-surface px-3 py-2.5"
        >
          <Lock class="size-4 shrink-0 text-glow-gold-cta" aria-hidden="true" />
          <span class="font-urbanist text-xs font-medium text-glow-text">Sem fidelidade</span>
        </li>
      </ul>
    </div>
  </section>
</template>
