<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  percent: number
  tone: 'entrada' | 'saida'
}>()

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))

const ringStyle = computed(() => {
  const color =
    props.tone === 'entrada'
      ? 'rgb(16 185 129)'
      : 'rgb(244 63 94)'
  const track = 'rgba(158, 148, 170, 0.2)'
  return {
    background: `conic-gradient(${color} ${clamped.value}%, ${track} 0)`,
  }
})
</script>

<template>
  <article
    class="flex items-center justify-between gap-4 rounded-2xl border border-glow-border-soft bg-glow-surface px-5 py-5 shadow-glow-sm"
  >
    <div class="min-w-0">
      <p class="font-urbanist text-sm font-medium text-glow-text-subtle">{{ label }}</p>
      <p
        class="mt-1 truncate font-satoshi text-xl font-bold tracking-tight sm:text-2xl"
        :class="tone === 'entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
      >
        {{ value }}
      </p>
      <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">
        {{ Math.round(clamped) }}% do movimento
      </p>
    </div>
    <div
      class="relative size-[72px] shrink-0 rounded-full sm:size-[84px]"
      :style="ringStyle"
      role="img"
      :aria-label="`${label}: ${Math.round(clamped)}%`"
    >
      <div
        class="absolute inset-[14%] rounded-full bg-glow-surface"
      />
    </div>
  </article>
</template>
