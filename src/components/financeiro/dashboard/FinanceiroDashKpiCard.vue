<script setup lang="ts">
import type { Component } from 'vue'
import FinanceiroTrendBadge from '@/components/financeiro/FinanceiroTrendBadge.vue'

defineProps<{
  label: string
  value: string
  icon: Component
  iconWrapClass?: string
  trend?: number | null
  trendLabel?: string
}>()
</script>

<template>
  <article
    class="flex items-center gap-3.5 rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 shadow-glow-sm"
  >
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-full"
      :class="iconWrapClass ?? 'bg-glow-gold/15 text-glow-gold-cta'"
    >
      <component :is="icon" class="size-5" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="font-urbanist text-xs font-medium text-glow-text-subtle">{{ label }}</p>
      <p class="mt-0.5 truncate font-satoshi text-xl font-bold tracking-tight text-glow-text sm:text-2xl">
        {{ value }}
      </p>
      <FinanceiroTrendBadge
        v-if="trend != null"
        class="mt-1"
        :value="trend"
        :label="trendLabel ?? 'vs período anterior'"
      />
    </div>
  </article>
</template>
