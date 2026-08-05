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
  <div class="cliente-stat-card group">
    <div class="flex w-full items-start justify-between">
      <span
        class="cliente-stat-card__icon"
        :class="iconClass ?? 'bg-glow-gold-cta/15 text-glow-gold-cta'"
      >
        <component :is="icon" :size="20" :stroke-width="1.75" />
      </span>
      <span
        v-if="hint"
        class="inline-flex items-center gap-0.5 rounded-full bg-glow-success-bg px-2 py-0.5 font-urbanist text-[11px] font-semibold text-glow-success-dark"
      >
        ↗ {{ hint }}
      </span>
    </div>

    <div v-if="loading" class="cliente-stat-card__skeleton" />
    <div v-else class="mt-3 flex flex-col gap-0.5">
      <p class="font-urbanist text-[26px] font-bold leading-none text-glow-text">{{ value }}</p>
      <p class="font-urbanist text-[13px] font-medium text-glow-text-subtle">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.cliente-stat-card {
  display: flex;
  flex-direction: column;
  min-height: 138px;
  width: 100%;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: 0 8px 24px -12px rgba(82, 46, 95, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.cliente-stat-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
  box-shadow: 0 14px 32px -16px rgba(82, 46, 95, 0.22);
}
.cliente-stat-card__icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.cliente-stat-card__skeleton {
  margin-top: auto;
  width: 100%;
  height: 52px;
  border-radius: 10px;
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