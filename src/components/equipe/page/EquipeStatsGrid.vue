<script setup lang="ts">
import type { EquipeStatItem } from './equipeStats'

defineProps<{
  items: EquipeStatItem[]
}>()
</script>

<template>
  <section class="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
    <article
      v-for="item in items"
      :key="item.id"
      class="rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-4 shadow-glow-sm"
    >
      <div class="flex items-start gap-3">
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="item.iconClass ?? 'bg-glow-gold/15 text-glow-gold-cta'"
        >
          <component :is="item.icon" class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="font-urbanist text-xs font-medium text-glow-text-subtle">{{ item.label }}</p>
          <p class="mt-0.5 font-satoshi text-2xl font-bold tracking-tight text-glow-text">
            {{ item.value }}
          </p>
          <p class="mt-0.5 font-urbanist text-[11px] text-glow-text-subtle">{{ item.hint }}</p>
        </div>
      </div>
    </article>
  </section>
</template>
