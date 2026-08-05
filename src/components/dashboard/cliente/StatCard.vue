<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string
  icon: Component
  iconClass?: string
  hint?: string | null
  loading?: boolean
}>()
</script>

<template>
  <div class="cliente-stat-card">
    <div class="flex w-full items-start justify-between gap-2">
      <span
        class="cliente-stat-card__icon"
        :class="iconClass ?? 'bg-glow-gold-cta/15 text-glow-gold-cta'"
      >
        <component :is="icon" :size="18" :stroke-width="1.75" />
      </span>
      <span
        v-if="hint"
        class="inline-flex items-center rounded-full bg-glow-success-bg px-1.5 py-0.5 font-urbanist text-[10px] font-semibold text-glow-success-dark"
      >
        {{ hint }}
      </span>
    </div>

    <div v-if="loading" class="cliente-stat-card__skeleton" />
    <div v-else class="mt-auto pt-3">
      <p class="font-urbanist text-[22px] font-bold leading-none tracking-tight text-glow-text sm:text-[24px]">
        {{ value }}
      </p>
      <p class="mt-1 font-urbanist text-[12px] font-medium text-glow-text-subtle">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.cliente-stat-card {
  display: flex;
  flex-direction: column;
  min-height: 112px;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: var(--glow-shadow-sm);
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}
.cliente-stat-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--glow-gold-cta) 35%, transparent);
}
.cliente-stat-card__icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}
.cliente-stat-card__skeleton {
  margin-top: auto;
  width: 70%;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--glow-text) 6%, transparent),
    color-mix(in srgb, var(--glow-text) 12%, transparent),
    color-mix(in srgb, var(--glow-text) 6%, transparent)
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
